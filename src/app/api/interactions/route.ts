import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/session";
import { recordInteraction } from "@/services/recommendation.service";
import { z } from "zod";

const interactionSchema = z.object({
  courseId: z.string().optional(),
  type: z.enum(["view", "search", "rate", "complete"]),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = interactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid interaction parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { courseId = "", type, metadata } = parsed.data;

    // Validate that we have courseId for course-based interactions
    if (type !== "search" && !courseId) {
      return NextResponse.json(
        { error: "courseId is required for this interaction type" },
        { status: 400 }
      );
    }

    const success = await recordInteraction(user.id, courseId, type, metadata);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("POST /api/interactions error:", error);
    return NextResponse.json(
      { error: "Failed to record user interaction" },
      { status: 500 }
    );
  }
}
