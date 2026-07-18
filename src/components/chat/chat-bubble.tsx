import React, { useState } from "react";
import { Copy, Check, RefreshCw, AlertCircle } from "lucide-react";
import type { ChatMessage } from "@/types/chat";
import { ChatMarkdown } from "./chat-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChatBubbleProps {
  message: ChatMessage;
  isLast: boolean;
  isLoading: boolean;
  onRegenerate?: () => void;
  onRetry?: (messageId: string, content: string) => void;
}

export function ChatBubble({
  message,
  isLast,
  isLoading,
  onRegenerate,
  onRetry,
}: ChatBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1.5 py-1.5",
        isUser ? "items-end" : "items-start"
      )}
    >
      <div className="flex max-w-[85%] items-end gap-2 sm:max-w-[75%]">
        {!isUser && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold font-sans">
            AI
          </div>
        )}

        <div className="flex flex-col gap-1">
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm shadow-xs transition-all duration-200",
              isUser
                ? "bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground rounded-br-xs"
                : "bg-muted/80 dark:bg-zinc-800/80 text-foreground border border-zinc-200/50 dark:border-zinc-700/30 rounded-bl-xs"
            )}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            ) : (
              <ChatMarkdown content={message.content} />
            )}
          </div>

          {/* Action buttons (Copy / Regenerate / Retry) */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-1.5 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200",
              // We force actions to be visible on touch devices or hover, let's keep them visible with slight transition:
              "opacity-100"
            )}
          >
            {!isUser && message.content && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-6 w-6 text-muted-foreground/60 hover:text-foreground hover:bg-muted"
                  title="Copy response"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>

                {isLast && !isLoading && onRegenerate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRegenerate}
                    className="h-6 w-6 text-muted-foreground/60 hover:text-foreground hover:bg-muted"
                    title="Regenerate response"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            )}

            {isUser && message.status === "failed" && onRetry && (
              <div className="flex items-center gap-1 text-red-500 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Failed</span>
                <Button
                  variant="link"
                  onClick={() => onRetry(message.id, message.content)}
                  className="h-auto p-0 px-1 text-xs text-red-500 font-semibold hover:text-red-600 underline"
                >
                  Retry
                </Button>
              </div>
            )}
          </div>
        </div>

        {isUser && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold">
            ME
          </div>
        )}
      </div>
    </div>
  );
}
