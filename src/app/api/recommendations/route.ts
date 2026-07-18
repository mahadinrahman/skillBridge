import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/session";
import { getRecommendations } from "@/services/recommendation.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const level = searchParams.get("level") || undefined;
    const maxPrice = Number(searchParams.get("maxPrice")) || undefined;
    const maxDuration = Number(searchParams.get("maxDuration")) || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 6;
    const refresh = searchParams.get("refresh") === "true";
    const refineCourseId = searchParams.get("refineCourseId") || undefined;

    const result = await getRecommendations(user.id, {
      category,
      level,
      maxPrice,
      maxDuration,
      page,
      limit,
      refresh,
      refineCourseId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
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

    // Force a fresh calculation by calling with refresh: true
    const result = await getRecommendations(user.id, { refresh: true });
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to refresh recommendations" },
      { status: 500 }
    );
  }
}
