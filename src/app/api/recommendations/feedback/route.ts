import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/session";
import { saveFeedback } from "@/services/recommendation.service";
import { z } from "zod";

const feedbackSchema = z.object({
  courseId: z.string().min(1),
  type: z.enum(["not_interested", "more_like_this", "click"]),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid feedback parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const success = await saveFeedback(user.id, parsed.data.courseId, parsed.data.type);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("POST /api/recommendations/feedback error:", error);
    return NextResponse.json(
      { error: "Failed to record recommendation feedback" },
      { status: 500 }
    );
  }
}
