import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, User } from "lucide-react";
import { requireAuth } from "@/auth/session";
import { getUserEnrollments } from "@/services/enrollment.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { AuthUser } from "@/lib/auth";

export const metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAuth();
  const user = session.user as AuthUser;

  if (user.role === "admin") {
    redirect("/admin");
  }

  const enrollments = await getUserEnrollments(user.id);
  const enrolledCourses = enrollments
    .map((e) => e.course)
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <div className="section-container py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name?.split(" ")[0]}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your learning progress and manage your enrolled courses.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enrolled Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{enrolledCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profile
            </CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/profile">View Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-6 text-xl font-semibold">My Enrolled Courses</h2>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No enrolled courses yet"
            description="Browse our catalog and enroll in your first course to start learning."
            actionLabel="Browse Courses"
            actionHref="/courses"
          />
        )}
      </div>
    </div>
  );
}
