import React from "react";

export function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2">
      <div className="flex items-center space-x-1.5 bg-muted/60 dark:bg-zinc-800/60 py-3 px-4 rounded-2xl rounded-bl-sm border border-zinc-200/50 dark:border-zinc-700/30">
        <span className="w-2.5 h-2.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
        <span className="w-2.5 h-2.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
        <span className="w-2.5 h-2.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
      </div>
    </div>
  );
}
