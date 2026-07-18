import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/session";
import { getOrCreateSession, clearSessionHistory } from "@/services/chat.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const user = await getCurrentUser();
    const session = await getOrCreateSession(sessionId, user?.id || null);

    return NextResponse.json({ messages: session.messages });
  } catch (error) {
    console.error("GET /api/chat/history error:", error);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    await clearSessionHistory(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/chat/history error:", error);
    return NextResponse.json({ error: "Failed to clear chat history" }, { status: 500 });
  }
}
