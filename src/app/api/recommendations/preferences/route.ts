import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/session";
import {
  getUserPreferences,
  saveUserPreferences,
} from "@/services/recommendation.service";
import { z } from "zod";

const preferencesSchema = z.object({
  favoriteCategories: z.array(z.string()),
  preferredDifficulty: z.enum(["Beginner", "Intermediate", "Advanced", "All"]),
  learningGoals: z.string().max(500),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await getUserPreferences(user.id);
    return NextResponse.json(preferences || {
      favoriteCategories: [],
      preferredDifficulty: "All",
      learningGoals: "",
    });
  } catch (error) {
    console.error("GET /api/recommendations/preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user preferences" },
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

    const body = await request.json();
    const parsed = preferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid preferences data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const preferences = await saveUserPreferences(user.id, parsed.data);
    return NextResponse.json(preferences);
  } catch (error) {
    console.error("POST /api/recommendations/preferences error:", error);
    return NextResponse.json(
      { error: "Failed to save user preferences" },
      { status: 500 }
    );
  }
}
