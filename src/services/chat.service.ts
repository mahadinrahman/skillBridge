import { getDb } from "@/lib/mongodb";
import type { ChatMessage, ChatSession } from "@/types/chat";

export async function getOrCreateSession(
  sessionId: string,
  userId: string | null = null
): Promise<ChatSession> {
  const db = await getDb();
  const collection = db.collection<ChatSession>("chat_sessions");

  // Try to find the session by sessionId
  let session = await collection.findOne({ sessionId });

  if (!session && userId) {
    // If not found by sessionId, but userId is provided, try to find the most recent session for this user
    session = await collection.findOne(
      { userId },
      { sort: { updatedAt: -1 } }
    );
  }

  const now = new Date();

  if (!session) {
    const newSession: ChatSession = {
      userId,
      sessionId,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    const result = await collection.insertOne(newSession);
    return { ...newSession, _id: result.insertedId.toString() };
  }

  // If session is found but userId is newly provided or changed, link it
  if (userId && session.userId !== userId) {
    await collection.updateOne(
      { sessionId: session.sessionId },
      { $set: { userId, updatedAt: now } }
    );
    session.userId = userId;
  }

  return {
    ...session,
    _id: session._id?.toString(),
  };
}

export async function addMessageToSession(
  sessionId: string,
  message: ChatMessage
): Promise<void> {
  const db = await getDb();
  const collection = db.collection<ChatSession>("chat_sessions");

  await collection.updateOne(
    { sessionId },
    {
      $push: { messages: message },
      $set: { updatedAt: new Date() },
    }
  );
}

export async function clearSessionHistory(sessionId: string): Promise<void> {
  const db = await getDb();
  const collection = db.collection<ChatSession>("chat_sessions");

  await collection.updateOne(
    { sessionId },
    {
      $set: { messages: [], updatedAt: new Date() },
    }
  );
}

export async function regenerateSessionResponse(
  sessionId: string
): Promise<ChatSession | null> {
  const db = await getDb();
  const collection = db.collection<ChatSession>("chat_sessions");
  const session = await collection.findOne({ sessionId });

  if (!session) return null;

  // Find the last assistant message index
  const messages = session.messages;
  let lastAssistantIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      lastAssistantIndex = i;
      break;
    }
  }

  if (lastAssistantIndex === -1) {
    return { ...session, _id: session._id?.toString() };
  }

  // Remove the last assistant message and any messages after it
  const newMessages = messages.slice(0, lastAssistantIndex);

  await collection.updateOne(
    { sessionId },
    {
      $set: { messages: newMessages, updatedAt: new Date() },
    }
  );

  return {
    ...session,
    _id: session._id?.toString(),
    messages: newMessages,
  };
}

export async function retrySessionResponse(
  sessionId: string,
  messageId: string
): Promise<ChatSession | null> {
  const db = await getDb();
  const collection = db.collection<ChatSession>("chat_sessions");
  const session = await collection.findOne({ sessionId });

  if (!session) return null;

  const messages = session.messages;
  const index = messages.findIndex((m) => m.id === messageId);

  if (index === -1) {
    return { ...session, _id: session._id?.toString() };
  }

  // Keep all messages up to the retried user message (inclusive)
  // Delete all subsequent messages (which would include the failed assistant response attempt)
  const newMessages = messages.slice(0, index + 1);

  await collection.updateOne(
    { sessionId },
    {
      $set: { messages: newMessages, updatedAt: new Date() },
    }
  );

  return {
    ...session,
    _id: session._id?.toString(),
    messages: newMessages,
  };
}
