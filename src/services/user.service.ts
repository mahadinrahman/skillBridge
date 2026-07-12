import { getDb } from "@/lib/mongodb";
import {
  getCourseCount,
  getCoursesByCategory,
} from "@/services/course.service";
import {
  getEnrollmentCount,
  getEnrollmentsByMonth,
} from "@/services/enrollment.service";
import type { AdminStats } from "@/types";

export async function getUserCount(): Promise<number> {
  const db = await getDb();
  return db.collection("user").countDocuments();
}

export async function getAdminStats(): Promise<AdminStats> {
  const [
    totalCourses,
    totalUsers,
    totalEnrollments,
    enrollmentsByMonth,
    coursesByCategory,
  ] = await Promise.all([
    getCourseCount(),
    getUserCount(),
    getEnrollmentCount(),
    getEnrollmentsByMonth(),
    getCoursesByCategory(),
  ]);

  return {
    totalCourses,
    totalUsers,
    totalEnrollments,
    enrollmentsByMonth,
    coursesByCategory,
  };
}
