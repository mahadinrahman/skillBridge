import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type {
  Course,
  CourseWithId,
  UserPreferences,
  CourseView,
  SearchHistory,
  CourseRating,
  CompletedCourse,
  RecommendationLog,
  RecommendationFeedback,
  RecommendationItem,
  PaginatedRecommendations,
} from "@/types";

// Helper to convert DB Course to CourseWithId
function toCourseWithId(course: Course): CourseWithId {
  return {
    id: course._id.toString(),
    title: course.title,
    shortDescription: course.shortDescription,
    description: course.description,
    price: course.price,
    category: course.category,
    level: course.level,
    duration: course.duration,
    image: course.image,
    rating: course.rating,
    createdBy: course.createdBy,
    createdAt: course.createdAt,
  };
}

// 1. Get user preferences
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const db = await getDb();
  return db.collection<UserPreferences>("user_preferences").findOne({ userId });
}

// 2. Save user preferences
export async function saveUserPreferences(
  userId: string,
  data: {
    favoriteCategories: string[];
    preferredDifficulty: "Beginner" | "Intermediate" | "Advanced" | "All";
    learningGoals: string;
  }
): Promise<UserPreferences> {
  const db = await getDb();
  const preferences: Omit<UserPreferences, "_id"> = {
    userId,
    favoriteCategories: data.favoriteCategories,
    preferredDifficulty: data.preferredDifficulty,
    learningGoals: data.learningGoals,
    updatedAt: new Date(),
  };

  const result = await db.collection<UserPreferences>("user_preferences").findOneAndUpdate(
    { userId },
    { $set: preferences },
    { upsert: true, returnDocument: "after" }
  );

  return result!;
}

// 3. Record course view or other implicit user interactions
export async function recordInteraction(
  userId: string,
  courseId: string,
  type: "view" | "search" | "rate" | "complete",
  metadata?: Record<string, any>
): Promise<boolean> {
  const db = await getDb();

  if (type === "view") {
    await db.collection<CourseView>("course_views").insertOne({
      userId,
      courseId,
      viewedAt: new Date(),
    });
  } else if (type === "search") {
    await db.collection<SearchHistory>("search_history").insertOne({
      userId,
      query: metadata?.query || "",
      searchedAt: new Date(),
    });
  } else if (type === "rate") {
    const ratingValue = Number(metadata?.rating);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) return false;
    await db.collection<CourseRating>("course_ratings").findOneAndUpdate(
      { userId, courseId },
      { $set: { rating: ratingValue, ratedAt: new Date() } },
      { upsert: true }
    );
  } else if (type === "complete") {
    await db.collection<CompletedCourse>("completed_courses").findOneAndUpdate(
      { userId, courseId },
      { $set: { completedAt: new Date() } },
      { upsert: true }
    );
  }
  return true;
}

// 4. Save feedback (not interested / more like this)
export async function saveFeedback(
  userId: string,
  courseId: string,
  feedbackType: "not_interested" | "more_like_this" | "click"
): Promise<boolean> {
  const db = await getDb();
  await db.collection<RecommendationFeedback>("recommendation_feedback").insertOne({
    userId,
    courseId,
    feedbackType,
    createdAt: new Date(),
  });

  // If not interested, we invalidate past recommendation logs for this user to force refresh
  if (feedbackType === "not_interested") {
    await db.collection<RecommendationLog>("recommendation_logs").deleteMany({ userId });
  }

  return true;
}

// Helper to filter courses by duration string (e.g. "42 hours" -> 42)
function parseDurationHours(durationStr: string): number {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Helper to get rule-based fallback recommendations
async function getRuleBasedFallback(
  userId: string,
  candidates: CourseWithId[],
  preferences: UserPreferences | null,
  refineCourseId?: string
): Promise<{ courseId: string; confidenceScore: number; reason: string }[]> {
  let refineCourse: CourseWithId | null = null;
  if (refineCourseId) {
    const db = await getDb();
    if (ObjectId.isValid(refineCourseId)) {
      const c = await db.collection<Course>("courses").findOne({ _id: new ObjectId(refineCourseId) });
      if (c) refineCourse = toCourseWithId(c);
    }
  }

  const favoriteCats = preferences?.favoriteCategories || [];
  const preferredDiff = preferences?.preferredDifficulty || "All";

  return candidates.map((course) => {
    let score = 50; // base score
    const reasons: string[] = [];

    // Refinement influence
    if (refineCourse) {
      if (course.category === refineCourse.category) {
        score += 25;
        reasons.push(`similar topic to ${refineCourse.title}`);
      }
      if (course.level === refineCourse.level) {
        score += 15;
        reasons.push(`same complexity level`);
      }
    }

    // Category match
    if (favoriteCats.includes(course.category)) {
      score += 20;
      reasons.push(`matches your interest in ${course.category}`);
    }

    // Difficulty match
    if (preferredDiff !== "All" && course.level === preferredDiff) {
      score += 15;
      reasons.push(`matches your preferred ${course.level} level`);
    }

    // Rating contribution
    if (course.rating >= 4.7) {
      score += 10;
      reasons.push(`highly rated by other students (${course.rating.toFixed(1)}★)`);
    }

    // Cap score at 98% for fallback rules
    const confidenceScore = Math.min(Math.max(score, 10), 98);
    const reasonText = reasons.length > 0
      ? `Recommended because it ${reasons.slice(0, 2).join(" and ")}.`
      : `Recommended based on its excellent rating of ${course.rating.toFixed(1)}/5 in the catalog.`;

    return {
      courseId: course.id,
      confidenceScore,
      reason: reasonText,
    };
  });
}

// 5. Generate or fetch AI Recommendations
export async function getRecommendations(
  userId: string,
  params: {
    category?: string;
    level?: string;
    maxPrice?: number;
    maxDuration?: number;
    page?: number;
    limit?: number;
    refresh?: boolean;
    refineCourseId?: string;
  } = {}
): Promise<PaginatedRecommendations> {
  const db = await getDb();
  const {
    category = "",
    level = "",
    maxPrice = 0,
    maxDuration = 0,
    page = 1,
    limit = 6,
    refresh = false,
    refineCourseId = "",
  } = params;

  // Fetch user contextual details in parallel
  const [
    preferences,
    enrollments,
    completed,
    views,
    searches,
    ratings,
    feedbackDocs,
  ] = await Promise.all([
    getUserPreferences(userId),
    db.collection("enrollments").find({ userId }).toArray(),
    db.collection<CompletedCourse>("completed_courses").find({ userId }).toArray(),
    db.collection<CourseView>("course_views").find({ userId }).sort({ viewedAt: -1 }).limit(10).toArray(),
    db.collection<SearchHistory>("search_history").find({ userId }).sort({ searchedAt: -1 }).limit(10).toArray(),
    db.collection<CourseRating>("course_ratings").find({ userId }).toArray(),
    db.collection<RecommendationFeedback>("recommendation_feedback").find({ userId }).toArray(),
  ]);

  // Extract relevant IDs
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  const completedCourseIds = new Set(completed.map((c) => c.courseId));
  const excludedCourseIds = new Set(
    feedbackDocs.filter((f) => f.feedbackType === "not_interested").map((f) => f.courseId)
  );

  // Fetch all courses in the market
  const allCoursesRaw = await db.collection<Course>("courses").find({}).toArray();
  const allCourses = allCoursesRaw.map(toCourseWithId);

  // Candidates = courses user is NOT enrolled in, has NOT completed, and hasn't marked "Not Interested"
  let candidates = allCourses.filter((course) => {
    return (
      !enrolledCourseIds.has(course.id) &&
      !completedCourseIds.has(course.id) &&
      !excludedCourseIds.has(course.id)
    );
  });

  // Apply basic explicit filters before passing to AI (saves prompt tokens & yields accurate results)
  if (category) {
    candidates = candidates.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }
  if (level) {
    candidates = candidates.filter((c) => c.level.toLowerCase() === level.toLowerCase());
  }
  if (maxPrice > 0) {
    candidates = candidates.filter((c) => c.price <= maxPrice);
  }
  if (maxDuration > 0) {
    candidates = candidates.filter((c) => parseDurationHours(c.duration) <= maxDuration);
  }

  // If no candidates are available, return empty early
  if (candidates.length === 0) {
    return {
      recommendations: [],
      total: 0,
      page,
      totalPages: 1,
    };
  }

  // Check if we have active cached recommendation logs matching the user's filters (unless refresh is triggered)
  const cachedLog = refresh
    ? null
    : await db.collection<RecommendationLog>("recommendation_logs").findOne(
        {
          userId,
          "filters.category": category || undefined,
          "filters.level": level || undefined,
          "filters.maxPrice": maxPrice || undefined,
          "filters.maxDuration": maxDuration || undefined,
        },
        { sort: { createdAt: -1 } }
      );

  let recommendationItems: { courseId: string; confidenceScore: number; reason: string }[] = [];

  if (cachedLog && cachedLog.recommendedCourses && cachedLog.recommendedCourses.length > 0) {
    recommendationItems = cachedLog.recommendedCourses;
  } else {
    // We need to generate new recommendations
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn("OpenAI API Key is missing. Falling back to rule-based recommendations.");
      recommendationItems = await getRuleBasedFallback(userId, candidates, preferences, refineCourseId);
    } else {
      try {
        // Prepare historical contexts for Prompt
        const enrolledTitles = allCourses
          .filter((c) => enrolledCourseIds.has(c.id))
          .map((c) => `"${c.title}" (${c.category}, ${c.level})`);
        
        const completedTitles = allCourses
          .filter((c) => completedCourseIds.has(c.id))
          .map((c) => `"${c.title}"`);
        
        const viewedTitles = views
          .map((v) => allCourses.find((c) => c.id === v.courseId))
          .filter((c): c is CourseWithId => !!c)
          .map((c) => `"${c.title}" (${c.category})`);

        const searchQueries = searches.map((s) => `"${s.query}"`);
        
        const courseRatingsInfo = ratings
          .map((r) => {
            const course = allCourses.find((c) => c.id === r.courseId);
            return course ? `"${course.title}" rated ${r.rating}/5` : null;
          })
          .filter(Boolean);

        // Find refinement course details
        let refinementContext = "";
        if (refineCourseId) {
          const refineCourse = allCourses.find((c) => c.id === refineCourseId);
          if (refineCourse) {
            refinementContext = `CRITICAL REFINEMENT REQUEST: Recommend courses similar to "${refineCourse.title}" in category "${refineCourse.category}" and level "${refineCourse.level}". Boost their confidence scores.`;
          }
        }

        // Format candidate list for OpenAI (keep only necessary details for token optimization)
        const candidatesFormatted = candidates.slice(0, 20).map((c) => ({
          id: c.id,
          title: c.title,
          shortDescription: c.shortDescription,
          category: c.category,
          level: c.level,
          price: c.price,
          duration: c.duration,
          rating: c.rating,
        }));

        const systemMessage = `You are an expert personalized course recommendation assistant for SkillBridge.
Analyze the student's profile, enrollment history, viewed courses, search queries, ratings, and learning goals to select the best matching courses from the Candidate Catalog.

You MUST respond ONLY with a valid, parsable JSON object containing recommended courses matching this strict schema:
{
  "recommendations": [
    {
      "courseId": "string",
      "confidenceScore": number (0 to 100),
      "reason": "string (1-2 sentences explaining specifically why this fits their profile, e.g. 'Since you completed React Masterclass, this intermediate course will help you expand into full-stack backend development.')"
    }
  ]
}`;

        const userContextMessage = `USER PROFILE & LOGS:
- Favorite Categories: ${preferences?.favoriteCategories?.join(", ") || "None specified"}
- Preferred Difficulty: ${preferences?.preferredDifficulty || "All"}
- Learning Goals: "${preferences?.learningGoals || "Learn new skills"}"
- Enrolled Courses: [${enrolledTitles.join(", ") || "None"}]
- Completed Courses: [${completedTitles.join(", ") || "None"}]
- Recently Viewed Courses: [${viewedTitles.join(", ") || "None"}]
- Recent Searches: [${searchQueries.join(", ") || "None"}]
- Course Ratings: [${courseRatingsInfo.join(", ") || "None"}]
${refinementContext}

CANDIDATE CATALOG (Top ${candidatesFormatted.length} matching candidate courses):
${JSON.stringify(candidatesFormatted, null, 2)}

INSTRUCTIONS:
1. Select up to 8 course recommendations from the Candidate Catalog that the user would find most beneficial.
2. Calculate a confidence score (0-100) based on alignment with user profile, goals, level, views, and categories.
3. Write a compelling reason that links the recommendation to their profile (explicitly reference their preferences, search keywords, views, or ratings if relevant).
4. Strictly return the JSON object described. Do not add markdown blocks like \`\`\`json or text wrapping.`;

        // Make OpenAI direct HTTP fetch
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemMessage },
              { role: "user", content: userContextMessage },
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI HTTP Error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        const contentStr = responseData.choices?.[0]?.message?.content;
        
        if (contentStr) {
          const parsed = JSON.parse(contentStr);
          recommendationItems = parsed.recommendations || [];
        } else {
          throw new Error("Empty content returned from OpenAI");
        }
      } catch (error) {
        console.error("OpenAI Recommendation generate error:", error);
        // Fallback to rule-based
        recommendationItems = await getRuleBasedFallback(userId, candidates, preferences, refineCourseId);
      }
    }

    // Save newly generated recommendations to logs (only if OpenAI or fallback returned items)
    if (recommendationItems.length > 0) {
      await db.collection<RecommendationLog>("recommendation_logs").insertOne({
        userId,
        recommendedCourses: recommendationItems,
        filters: {
          category: category || undefined,
          level: level || undefined,
          maxPrice: maxPrice || undefined,
          maxDuration: maxDuration || undefined,
        },
        createdAt: new Date(),
      });
    }
  }

  // Merge the recommendation scores and reasons back with the complete course details
  const recommendationMap = new Map(recommendationItems.map((item) => [item.courseId, item]));

  const recommendedCourses: RecommendationItem[] = candidates
    .filter((course) => recommendationMap.has(course.id))
    .map((course) => {
      const rec = recommendationMap.get(course.id)!;
      return {
        ...course,
        confidenceScore: rec.confidenceScore,
        recommendationReason: rec.reason,
      };
    })
    .sort((a, b) => b.confidenceScore - a.confidenceScore); // Sort by highest confidence score first

  // Implement Pagination on recommendations
  const total = recommendedCourses.length;
  const skip = (page - 1) * limit;
  const paginatedRecs = recommendedCourses.slice(skip, skip + limit);

  return {
    recommendations: paginatedRecs,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
