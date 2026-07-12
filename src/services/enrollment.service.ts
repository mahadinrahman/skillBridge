import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { CourseWithId, Enrollment, EnrollmentWithCourse } from "@/types";
import { getCourseById } from "@/services/course.service";

export async function enrollUser(
  userId: string,
  courseId: string
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();

  const course = await getCourseById(courseId);
  if (!course) {
    return { success: false, message: "Course not found" };
  }

  const existing = await db.collection<Enrollment>("enrollments").findOne({
    userId,
    courseId,
  });

  if (existing) {
    return { success: false, message: "Already enrolled in this course" };
  }

  await db.collection<Enrollment>("enrollments").insertOne({
    userId,
    courseId,
    enrolledAt: new Date(),
  } as Enrollment);

  return { success: true, message: "Enrolled successfully" };
}

export async function getUserEnrollments(
  userId: string
): Promise<EnrollmentWithCourse[]> {
  const db = await getDb();
  const enrollments = await db
    .collection<Enrollment>("enrollments")
    .find({ userId })
    .sort({ enrolledAt: -1 })
    .toArray();

  const courses = await Promise.all(
    enrollments.map(async (enrollment) => {
      const course = await getCourseById(enrollment.courseId);
      return {
        ...enrollment,
        _id: enrollment._id.toString(),
        course: course ?? undefined,
      };
    })
  );

  return courses;
}

export async function isUserEnrolled(
  userId: string,
  courseId: string
): Promise<boolean> {
  const db = await getDb();
  const enrollment = await db.collection<Enrollment>("enrollments").findOne({
    userId,
    courseId,
  });
  return !!enrollment;
}

export async function getEnrollmentCount(): Promise<number> {
  const db = await getDb();
  return db.collection("enrollments").countDocuments();
}

export async function getEnrollmentsByMonth(): Promise<
  { month: string; count: number }[]
> {
  const db = await getDb();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const result = await db
    .collection<Enrollment>("enrollments")
    .aggregate<{ _id: { year: number; month: number }; count: number }>([
      { $match: { enrolledAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$enrolledAt" },
            month: { $month: "$enrolledAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])
    .toArray();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return result.map((item) => ({
    month: monthNames[item._id.month - 1],
    count: item.count,
  }));
}
