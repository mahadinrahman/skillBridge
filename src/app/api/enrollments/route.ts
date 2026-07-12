import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/session";
import {
  enrollUser,
  getUserEnrollments,
} from "@/services/enrollment.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await getUserEnrollments(user.id);
    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("GET /api/enrollments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const result = await enrollUser(user.id, courseId);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ message: result.message }, { status: 201 });
  } catch (error) {
    console.error("POST /api/enrollments error:", error);
    return NextResponse.json(
      { error: "Failed to enroll" },
      { status: 500 }
    );
  }
}
