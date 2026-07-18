import { MongoClient, ObjectId } from "mongodb";
import { loadEnvConfig } from "@next/env";

// Load environment variables from .env files
loadEnvConfig(process.cwd());

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/skillbridge";

async function seedInteractions() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    // 1. Find our test user or the first user in the database
    let user = await db.collection("user").findOne({ email: "test@example.com" });
    if (!user) {
      user = await db.collection("user").findOne({});
    }
    if (!user) {
      console.log("No users found in database. Please register an account first in the UI, then run this seed command to populate their interaction history.");
      return;
    }

    const userId = user._id.toString();
    console.log(`Seeding interaction history for user: ${user.name} (${user.email}) - ID: ${userId}`);

    // 2. Fetch courses to link interactions
    const courses = await db.collection("courses").find({}).toArray();
    if (courses.length === 0) {
      console.log("No courses found in database. Please run npm run seed first.");
      return;
    }

    const reactCourse = courses.find(c => c.title.includes("React"));
    const pythonCourse = courses.find(c => c.title.includes("Python"));
    const designCourse = courses.find(c => c.title.includes("Design"));

    // 3. Clear existing logs for a fresh seed
    await Promise.all([
      db.collection("user_preferences").deleteMany({ userId }),
      db.collection("course_views").deleteMany({ userId }),
      db.collection("search_history").deleteMany({ userId }),
      db.collection("course_ratings").deleteMany({ userId }),
      db.collection("completed_courses").deleteMany({ userId }),
      db.collection("recommendation_logs").deleteMany({ userId }),
      db.collection("recommendation_feedback").deleteMany({ userId }),
    ]);

    // 4. Seed explicit Preferences
    await db.collection("user_preferences").insertOne({
      userId,
      favoriteCategories: ["Web Development", "Data Science"],
      preferredDifficulty: "Intermediate",
      learningGoals: "I want to master web development with Next.js, learn python data analytics, and build AI projects.",
      updatedAt: new Date()
    });
    console.log("- Seeded user preferences (Goals: Web Dev, Data Science, Intermediate level)");

    // 5. Seed implicit Course Views
    if (reactCourse) {
      await db.collection("course_views").insertOne({
        userId,
        courseId: reactCourse._id.toString(),
        viewedAt: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
      });
    }
    if (pythonCourse) {
      await db.collection("course_views").insertOne({
        userId,
        courseId: pythonCourse._id.toString(),
        viewedAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      });
    }
    console.log("- Seeded 2 course views (React, Python)");

    // 6. Seed Search Queries
    await db.collection("search_history").insertMany([
      { userId, query: "next.js state", searchedAt: new Date(Date.now() - 1000 * 60 * 15) },
      { userId, query: "pandas tutorials", searchedAt: new Date(Date.now() - 1000 * 60 * 45) },
    ]);
    console.log("- Seeded 2 search queries ('next.js state', 'pandas tutorials')");

    // 7. Seed Course Ratings
    if (reactCourse) {
      await db.collection("course_ratings").insertOne({
        userId,
        courseId: reactCourse._id.toString(),
        rating: 5,
        ratedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      });
      console.log("- Seeded course rating (5★ on React Course)");
    }

    // 8. Seed Course Completions
    if (designCourse) {
      await db.collection("completed_courses").insertOne({
        userId,
        courseId: designCourse._id.toString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      });
      console.log("- Seeded completed course (UI/UX Design Fundamentals)");
    }

    console.log("Seeding complete! Log in to SkillBridge and visit the AI Recommendations page to see personalized recommendations.");

  } catch (error) {
    console.error("Seeding interactions failed:", error);
  } finally {
    await client.close();
  }
}

seedInteractions();
