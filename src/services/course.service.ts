import { ObjectId, type Filter } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type {
  Course,
  CourseWithId,
  CoursesQueryParams,
  PaginatedCourses,
} from "@/types";

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

export async function getCourses(
  params: CoursesQueryParams = {}
): Promise<PaginatedCourses> {
  const db = await getDb();
  const {
    search = "",
    category = "",
    level = "",
    sort = "newest",
    page = 1,
    limit = 8,
  } = params;

  const filter: Filter<Course> = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { shortDescription: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (level) {
    filter.level = level;
  }

  const sortMap = {
    "price-asc": { price: 1 as const },
    "price-desc": { price: -1 as const },
    "rating-desc": { rating: -1 as const },
    newest: { createdAt: -1 as const },
  };

  const skip = (page - 1) * limit;
  const collection = db.collection<Course>("courses");

  const [courses, total] = await Promise.all([
    collection
      .find(filter)
      .sort(sortMap[sort])
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    courses: courses.map(toCourseWithId),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getCourseById(id: string): Promise<CourseWithId | null> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return null;

  const course = await db
    .collection<Course>("courses")
    .findOne({ _id: new ObjectId(id) });

  return course ? toCourseWithId(course) : null;
}

export async function getFeaturedCourses(limit = 4): Promise<CourseWithId[]> {
  const db = await getDb();
  const courses = await db
    .collection<Course>("courses")
    .find({})
    .sort({ rating: -1 })
    .limit(limit)
    .toArray();

  return courses.map(toCourseWithId);
}

export async function getRelatedCourses(
  courseId: string,
  category: string,
  limit = 4
): Promise<CourseWithId[]> {
  const db = await getDb();
  const courses = await db
    .collection<Course>("courses")
    .find({
      category,
      _id: { $ne: new ObjectId(courseId) },
    })
    .sort({ rating: -1 })
    .limit(limit)
    .toArray();

  return courses.map(toCourseWithId);
}

export async function createCourse(
  data: Omit<Course, "_id" | "createdAt">
): Promise<CourseWithId> {
  const db = await getDb();
  const course: Omit<Course, "_id"> = {
    ...data,
    createdAt: new Date(),
  };

  const result = await db.collection<Course>("courses").insertOne(
    course as Course
  );

  return toCourseWithId({ ...course, _id: result.insertedId } as Course);
}

export async function deleteCourse(id: string): Promise<boolean> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return false;

  const result = await db
    .collection<Course>("courses")
    .deleteOne({ _id: new ObjectId(id) });

  await db.collection("enrollments").deleteMany({ courseId: id });

  return result.deletedCount > 0;
}

export async function getAllCourses(): Promise<CourseWithId[]> {
  const db = await getDb();
  const courses = await db
    .collection<Course>("courses")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return courses.map(toCourseWithId);
}

export async function getCourseCount(): Promise<number> {
  const db = await getDb();
  return db.collection("courses").countDocuments();
}

export async function getCoursesByCategory(): Promise<
  { category: string; count: number }[]
> {
  const db = await getDb();
  const result = await db
    .collection<Course>("courses")
    .aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  return result.map((item) => ({
    category: item._id,
    count: item.count,
  }));
}
