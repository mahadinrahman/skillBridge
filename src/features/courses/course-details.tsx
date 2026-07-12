"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  Layers,
  Star,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import type { CourseWithId } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CourseCard } from "@/components/courses/course-card";
import { formatPrice } from "@/lib/utils";

interface CourseDetailsProps {
  course: CourseWithId;
  relatedCourses: CourseWithId[];
  isEnrolled: boolean;
}

export function CourseDetails({
  course,
  relatedCourses,
  isEnrolled,
}: CourseDetailsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);

  const handleEnroll = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/courses/${course.id}`);
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to enroll");
        return;
      }

      setEnrolled(true);
      toast.success("Successfully enrolled in the course!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="section-container py-12">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video overflow-hidden rounded-2xl">
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {course.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {course.shortDescription}
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">About This Course</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {course.description.split("\n\n").map((paragraph, i) => (
                <p key={i} className="mb-4 text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-6">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(course.price)}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Duration: {course.duration}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Level: {course.level}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Category: {course.category}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <User className="h-4 w-4 text-primary" />
                  <span>Rating: {course.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              {enrolled ? (
                <Button className="w-full" variant="secondary" disabled>
                  Enrolled
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </Button>
              )}

              {!session && (
                <p className="text-center text-xs text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>{" "}
                  to enroll in this course
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {relatedCourses.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 text-2xl font-bold">Related Courses</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {relatedCourses.map((related) => (
              <CourseCard key={related.id} course={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
