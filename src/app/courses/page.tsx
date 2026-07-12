import { Suspense } from "react";
import { CourseGridSkeleton } from "@/components/courses/course-skeleton";
import { CoursesListing } from "@/features/courses/courses-listing";

export const metadata = {
  title: "Courses",
};

export default function CoursesPage() {
  return (
    <Suspense fallback={<CourseGridSkeleton />}>
      <CoursesListing />
    </Suspense>
  );
}
