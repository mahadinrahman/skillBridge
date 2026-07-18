export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  status?: "sending" | "success" | "failed";
}

export interface ChatSession {
  _id?: string;
  userId: string | null;
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
