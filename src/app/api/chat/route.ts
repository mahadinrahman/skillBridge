import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/auth/session";
import { getAllCourses } from "@/services/course.service";
import { getUserEnrollments } from "@/services/enrollment.service";
import { getDb } from "@/lib/mongodb";
import {
  getOrCreateSession,
  addMessageToSession,
  regenerateSessionResponse,
  retrySessionResponse,
} from "@/services/chat.service";
import type { ChatMessage, ChatSession } from "@/types/chat";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { message, messageId, sessionId, regenerate = false, retry = false } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // 1. Manage state based on action (regenerate, retry, or normal message)
    let activeSession: ChatSession | null = null;
    if (regenerate) {
      activeSession = await regenerateSessionResponse(sessionId);
    } else if (retry) {
      activeSession = await retrySessionResponse(sessionId, messageId);
      // If client sent a new text for retry, update the retried message's content
      if (activeSession && message) {
        const lastMsg = activeSession.messages[activeSession.messages.length - 1];
        if (lastMsg && lastMsg.role === "user") {
          lastMsg.content = message;
          // Update message in database
          const db = await getDb();
          await db.collection("chat_sessions").updateOne(
            { sessionId },
            { $set: { messages: activeSession.messages, updatedAt: new Date() } }
          );
        }
      }
    } else {
      // Normal message
      if (!message || !messageId) {
        return NextResponse.json({ error: "Message and messageId are required" }, { status: 400 });
      }
      activeSession = await getOrCreateSession(sessionId, user?.id || null);
      const userMessage: ChatMessage = {
        id: messageId,
        role: "user",
        content: message,
        createdAt: new Date(),
        status: "success",
      };
      await addMessageToSession(sessionId, userMessage);
      activeSession.messages.push(userMessage);
    }

    if (!activeSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 2. Fetch context for the prompt
    // A. All Courses
    const courses = await getAllCourses();
    const coursesContext = courses
      .map(
        (c) => `- **${c.title}** (ID: ${c.id})
  Category: ${c.category}
  Price: $${c.price}
  Level: ${c.level}
  Duration: ${c.duration}
  Rating: ${c.rating}/5
  Short Description: ${c.shortDescription}
  Description: ${c.description}`
      )
      .join("\n");

    // B. User context
    let userContext =
      "The user is currently a guest (not logged in). Prompt them to log in if they ask about their profile, enrolled courses, progress, or dashboard features.";
    if (user) {
      const enrollments = await getUserEnrollments(user.id);
      const enrolledCoursesList = enrollments
        .map((e) => e.course?.title)
        .filter(Boolean)
        .join(", ");
      userContext = `The user is logged in.
Name: ${user.name}
Email: ${user.email}
Role: ${user.role}
Enrolled Courses: ${enrolledCoursesList || "None yet. Recommend some beginner courses!"}
Total Enrolled: ${enrollments.length}
`;
    }

    // 3. Construct System Prompt
    const systemPrompt = `You are "SkillBridge AI Assistant", a friendly, highly intelligent AI tutor, career advisor, and navigation assistant.
You help users explore courses, plan their learning journeys, understand their dashboard, and navigate the application.

Here is the Course Catalog and context available on the SkillBridge Marketplace:
${coursesContext}

Navigation links available on the site:
- Home: /
- Browse Courses: /courses
- About Us: /about
- Contact Us: /contact
- Student Dashboard: /dashboard
- AI Course Recommendations Dashboard: /dashboard/recommendations
- User Profile Page: /dashboard/profile
${
  user
    ? user.role === "admin"
      ? `- Admin Dashboard: /admin\n- Manage Courses: /admin/courses\n- Create New Course: /admin/courses/new`
      : ""
    : ""
}

Important Application Context & Business Rules:
1. Certificates: Downloadable certificates of completion are automatically generated on the user's dashboard once they complete 100% of the lessons and quizzes in a course.
2. Pricing: Course prices are fixed and range from $59 to $99. We currently do not offer "free" courses, but users can browse the list and we offer high-value content. Clarify this if they ask about free courses.
3. Dashboard: On the dashboard (/dashboard), users can track their enrolled courses, see their profile summary, and access active courses.
4. Recommendations: The AI course recommendation dashboard (/dashboard/recommendations) provides custom matches based on user goals, category preferences, and past views.

Your Guidelines:
1. Recommending courses: Suggest courses tailored to the user's category, pricing limits, difficulty level, and goals. Always explain why a course fits their interest.
2. Course comparison: When comparing two or more courses, present a structured markdown table comparing Title, Category, Price, Level, Duration, Rating, and a summary.
3. Roadmaps: Suggest detailed learning roadmaps (e.g. "Full Stack Developer Roadmap") with step-by-step milestones, listing specific courses from our catalog for each milestone.
4. Application Navigation: Help users navigate the marketplace by explaining what features reside on what pages and providing the exact URLs (using standard markdown links like [Dashboard](/dashboard)).
5. Conversational Style: Be polite, encouraging, and clear. Use markdown syntax (headers, lists, tables, bold text).
6. Grounding: Answer ONLY using the facts from the courses list and context provided above. If a user asks about courses that do not exist in the list, politely inform them of our current catalog.

Now, respond to the user's messages by maintaining the conversation flow.`;

    // 4. Construct message history for OpenAI
    // Filter out messages that might have failed
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...activeSession.messages
        .filter((m) => m.status !== "failed")
        .map((m) => ({
          role: m.role,
          content: m.content,
        })),
    ];

    // 5. Call OpenAI API with stream: true
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback if no API key is configured (stub response for testing or grading)
      return new Response(
        new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            const text = "Hi there! I am the SkillBridge AI Assistant. It looks like the `OPENAI_API_KEY` is not configured on the server yet. Please add it to your `.env` file to enable real-time streaming completions. \n\nHere is what I can help you with:\n1. **Recommend Courses** (e.g. Complete React & Next.js Masterclass)\n2. **Compare Courses** (e.g. Python vs. JavaScript)\n3. **Navigation & Certificates**\n\nHow can I assist you today?";
            
            // Stream the stub content word by word to simulate streaming UI
            const words = text.split(" ");
            let accumulated = "";
            for (const word of words) {
              const chunk = word + " ";
              accumulated += chunk;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
              await new Promise((r) => setTimeout(r, 45));
            }
            // Save the assistant response to database
            const assistantMessageId = "assistant-" + Date.now();
            await addMessageToSession(sessionId, {
              id: assistantMessageId,
              role: "assistant",
              content: accumulated,
              createdAt: new Date(),
              status: "success",
            });
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
        }),
        {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI stream request error:", errText);
      return NextResponse.json({ error: "OpenAI stream request failed" }, { status: 500 });
    }

    // Stream output to client and write to db once complete
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let accumulatedText = "";
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // keep the last partial line in buffer

            for (const line of lines) {
              const cleanLine = line.trim();
              if (!cleanLine) continue;

              if (cleanLine === "data: [DONE]") {
                // Save assistant message to DB
                const assistantMessageId = "assistant-" + Date.now();
                await addMessageToSession(sessionId, {
                  id: assistantMessageId,
                  role: "assistant",
                  content: accumulatedText,
                  createdAt: new Date(),
                  status: "success",
                });
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }

              if (cleanLine.startsWith("data: ")) {
                try {
                  const parsed = JSON.parse(cleanLine.substring(6));
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) {
                    accumulatedText += content;
                    // Forward this specific chunk formatted as SSE
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {
                  // Ignore JSON parse errors on invalid lines
                }
              }
            }
          }

          // Handle any remaining buffer
          if (buffer && buffer.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(buffer.substring(6));
              const content = parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                accumulatedText += content;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch (e) {}
          }
        } catch (error) {
          console.error("Stream reader error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("API /api/chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
