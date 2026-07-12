import { NextRequest, NextResponse } from "next/server";
import { getCourses, createCourse } from "@/services/course.service";
import { getCurrentUser } from "@/auth/session";
import type { CoursesQueryParams } from "@/types";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(3),
  shortDescription: z.string().min(10),
  description: z.string().min(20),
  price: z.number().min(0),
  category: z.string().min(1),
  level: z.string().min(1),
  duration: z.string().min(1),
  image: z.string().url(),
  rating: z.number().min(0).max(5),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: CoursesQueryParams = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      level: searchParams.get("level") || undefined,
      sort: (searchParams.get("sort") as CoursesQueryParams["sort"]) || "newest",
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 8,
    };

    const result = await getCourses(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = courseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid course data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const course = await createCourse({
      ...parsed.data,
      createdBy: user.id,
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses error:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
