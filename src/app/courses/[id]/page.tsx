import { notFound } from "next/navigation";
import { getCurrentUser } from "@/auth/session";
import {
  getCourseById,
  getRelatedCourses,
} from "@/services/course.service";
import { isUserEnrolled } from "@/services/enrollment.service";
import { CourseDetails } from "@/features/courses/course-details";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CoursePageProps) {
  const { id } = await params;
  const course = await getCourseById(id);
  return {
    title: course?.title || "Course Not Found",
    description: course?.shortDescription,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    notFound();
  }

  const [relatedCourses, user] = await Promise.all([
    getRelatedCourses(id, course.category),
    getCurrentUser(),
  ]);

  const enrolled = user ? await isUserEnrolled(user.id, id) : false;

  return (
    <CourseDetails
      course={course}
      relatedCourses={relatedCourses}
      isEnrolled={enrolled}
    />
  );
}
