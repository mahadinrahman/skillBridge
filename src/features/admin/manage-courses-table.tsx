"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CourseWithId } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

async function fetchAllCourses(): Promise<CourseWithId[]> {
  const res = await fetch("/api/courses?limit=100");
  if (!res.ok) throw new Error("Failed to fetch courses");
  const data = await res.json();
  return data.courses;
}

export function ManageCoursesTable() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: fetchAllCourses,
  });

  const executeDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete course");
        return;
      }
      toast.success("Course deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };


 const handleDeletePrompt = (id: string, title: string) => {
  toast.custom((t) => (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-border bg-background p-4 shadow-lg sm:max-w-sm">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Delete Course?
        </h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          Are you sure you want to delete <span className="font-medium text-foreground">"{title}"</span>? This action cannot be undone.
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => toast.dismiss(t)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            toast.dismiss(t);
            executeDelete(id);
          }}
          className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
        >
          Delete
        </button>
      </div>
    </div>
  ), {
    duration: 6000,
    position: "top-center" 
  });
};


  return (
    <div className="section-container py-12">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
          <p className="mt-2 text-muted-foreground">
            View, edit, and delete courses on the platform.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">Add Course</Link>
        </Button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Level</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-14 overflow-hidden rounded-md">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <span className="font-medium line-clamp-1">{course.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">{course.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{course.level}</TableCell>
                  <TableCell>{formatPrice(course.price)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/courses/${course.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        disabled={deletingId === course.id}
                        onClick={() => handleDeletePrompt(course.id, course.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            No courses yet.{" "}
            <Link href="/admin/courses/new" className="text-primary hover:underline">
              Add your first course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}