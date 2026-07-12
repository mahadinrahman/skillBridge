import Link from "next/link";
import { getFeaturedCourses } from "@/services/course.service";
import { CourseCard } from "@/components/courses/course-card";
import { Button } from "@/components/ui/button";

export async function FeaturedCourses() {
  const courses = await getFeaturedCourses(3);

  return (
    <section className="py-20">
      <div className="section-container">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Courses</h2>
            <p className="mt-2 text-muted-foreground">
              Hand-picked courses with the highest ratings from our community.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/courses">View All Courses</Link>
          </Button>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Courses coming soon. Check back shortly!
          </p>
        )}
      </div>
    </section>
  );
}
