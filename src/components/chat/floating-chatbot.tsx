"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Trash2,
  Send,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { ChatBubble } from "./chat-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Suggested follow-up prompts
const SUGGESTED_PROMPTS = [
  "Recommend a React course",
  "Which beginner course is best?",
  "Compare React and Next.js",
  "Explain Full Stack Roadmap",
  "Show free courses",
];

function getOrGenerateSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("sb_chat_session_id");
  if (!id) {
    id =
      "session_" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    localStorage.setItem("sb_chat_session_id", id);
  }
  return id;
}

export function FloatingChatbot() {
  const { data: sessionData } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Session ID
  useEffect(() => {
    setSessionId(getOrGenerateSessionId());
  }, []);

  // Fetch Session History on Mount or when Session ID is ready
  useEffect(() => {
    if (!sessionId) return;

    async function loadHistory() {
      try {
        const res = await fetch(`/api/chat/history?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    }

    loadHistory();
  }, [sessionId, sessionData?.user?.id]); // Reload if user logs in/out to sync

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle stream reader from API
  const handleChatStream = async (
    text: string,
    messageId: string,
    options: { regenerate?: boolean; retry?: boolean } = {}
  ) => {
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    // Prepare temp assistant message ID
    const assistantMsgId = "assistant-" + Date.now();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          messageId,
          sessionId,
          regenerate: options.regenerate,
          retry: options.retry,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      // Read streaming chunks
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No reader in streaming response");
      }

      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";
      let hasStartedTyping = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // retain incomplete line

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed === "data: [DONE]") {
              setIsTyping(false);
              continue;
            }

            if (trimmed.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(trimmed.substring(6));
                const textChunk = parsed.content;

                if (textChunk) {
                  if (!hasStartedTyping) {
                    hasStartedTyping = true;
                    setIsTyping(false); // remove typing animation, start showing text

                    // Append a blank assistant message to start streaming into
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: assistantMsgId,
                        role: "assistant",
                        content: textChunk,
                        createdAt: new Date(),
                        status: "success",
                      },
                    ]);
                  } else {
                    // Update the last assistant message
                    setMessages((prev) => {
                      const updated = [...prev];
                      const last = updated[updated.length - 1];
                      if (last && last.role === "assistant") {
                        last.content += textChunk;
                      }
                      return updated;
                    });
                  }
                }
              } catch (e) {
                // Ignore json parsing issues
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Streaming chat error:", err);
      setError("Unable to get AI response. Please try again.");

      // Mark the user message (or the corresponding active message) as failed
      setMessages((prev) => {
        const updated = [...prev];
        // If the last message is a user message, mark it as failed
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === "user") {
          lastMsg.status = "failed";
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Submit new message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessageId = "user-" + Date.now();
    const originalText = textToSend;

    // Add user message locally
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: originalText,
      createdAt: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    inputRef.current?.focus();

    await handleChatStream(originalText, userMessageId);

    // Update status to success once API is done (unless marked failed by error branch)
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === userMessageId && msg.status === "sending"
          ? { ...msg, status: "success" }
          : msg
      )
    );
  };

  // Regenerate Response
  const handleRegenerate = async () => {
    if (isLoading || messages.length === 0) return;

    // Remove the last assistant response from the local list
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant") {
        return prev.slice(0, -1);
      }
      return prev;
    });

    await handleChatStream("", "", { regenerate: true });
  };

  // Retry failed user message
  const handleRetry = async (messageId: string, content: string) => {
    if (isLoading) return;

    // Remove failed messages from target point onwards
    const msgIndex = messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Keep messages before this one, and prepare to re-send this user message
    setMessages((prev) => {
      const truncated = prev.slice(0, msgIndex);
      return [
        ...truncated,
        {
          id: messageId,
          role: "user",
          content,
          createdAt: new Date(),
          status: "sending",
        },
      ];
    });

    await handleChatStream(content, messageId, { retry: true });

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.status === "sending"
          ? { ...msg, status: "success" }
          : msg
      )
    );
  };

  // Clear history
  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      try {
        const res = await fetch(`/api/chat/history?sessionId=${sessionId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setMessages([]);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to clear chat history:", err);
      }
    }
  };

  // Key Down Events on Input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <>
      {/* Floating Action Button Launcher */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-lg text-primary-foreground hover:scale-105 transition-transform duration-200"
          title="Open AI Chat Assistant"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6 animate-pulse" />}
        </Button>
      </div>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-50 flex h-[580px] w-[calc(100vw-2rem)] flex-col rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-background/95 backdrop-blur-md shadow-2xl overflow-hidden sm:right-6 sm:w-[420px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground text-sm font-bold shadow-xs">
                  <Sparkles className="h-4 w-4" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500 animate-ping"></span>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500"></span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">
                    SkillBridge AI Tutor
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Always online • Ready to help
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearHistory}
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    title="Clear conversation history"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Close assistant"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                /* Welcome panel / quick start guide */
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h4 className="font-semibold text-foreground text-sm">
                      Welcome to SkillBridge AI!
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ask me questions about course syllabi, roadmap planning,
                      enrolled courses, dashboards, certificates, or navigation.
                    </p>
                  </div>

                  <div className="w-full space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block text-left">
                      Suggested prompts:
                    </span>
                    <div className="flex flex-wrap gap-2 justify-start">
                      {SUGGESTED_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSendMessage(prompt)}
                          className="text-xs bg-muted hover:bg-muted/80 border border-zinc-200 dark:border-zinc-700/50 hover:border-primary/40 dark:hover:border-primary/40 text-foreground px-3 py-1.5 rounded-full transition-all text-left"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Chat message bubbles list */
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <ChatBubble
                      key={message.id || index}
                      message={message}
                      isLast={index === messages.length - 1}
                      isLoading={isLoading}
                      onRegenerate={handleRegenerate}
                      onRetry={handleRetry}
                    />
                  ))}
                  {isTyping && <TypingIndicator />}
                  {error && (
                    <div className="flex items-center gap-2 p-3 text-xs border border-red-200/50 bg-red-50/50 dark:bg-red-950/20 dark:border-red-950/40 rounded-xl text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={handleRegenerate}
                        className="h-auto p-0 ml-auto text-red-600 dark:text-red-400 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <RotateCw className="h-3 w-3" /> Retry
                      </Button>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 p-3 bg-muted/20">
              <div className="relative flex items-center bg-background border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 pr-2 pl-3 py-1.5">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  rows={1}
                  className="w-full resize-none bg-transparent border-0 focus:outline-hidden p-0 text-sm focus-visible:ring-0 min-h-[20px] max-h-[100px] leading-relaxed shadow-none pr-10"
                  style={{ height: "auto" }}
                />
                <Button
                  size="icon"
                  disabled={!inputValue.trim() || isLoading}
                  onClick={() => handleSendMessage(inputValue)}
                  className="absolute right-2 bottom-1.5 h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-xs shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-1.5 text-center text-[10px] text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
