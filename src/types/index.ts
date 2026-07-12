import type { ObjectId } from "mongodb";

export type UserRole = "admin" | "user";

export interface User {
  _id: ObjectId | string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  createdAt: Date;
}

export interface Course {
  _id: ObjectId | string;
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  category: string;
  level: string;
  duration: string;
  image: string;
  rating: number;
  createdBy: string;
  createdAt: Date;
}

export interface Enrollment {
  _id: ObjectId | string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
}

export interface CourseWithId extends Omit<Course, "_id"> {
  id: string;
}

export interface EnrollmentWithCourse extends Enrollment {
  course?: CourseWithId;
}

export interface AdminStats {
  totalCourses: number;
  totalUsers: number;
  totalEnrollments: number;
  enrollmentsByMonth: { month: string; count: number }[];
  coursesByCategory: { category: string; count: number }[];
}

export interface CoursesQueryParams {
  search?: string;
  category?: string;
  level?: string;
  sort?: "price-asc" | "price-desc" | "rating-desc" | "newest";
  page?: number;
  limit?: number;
}

export interface PaginatedCourses {
  courses: CourseWithId[];
  total: number;
  page: number;
  totalPages: number;
}
