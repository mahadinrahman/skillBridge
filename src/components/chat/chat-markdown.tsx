import React from "react";
import Link from "next/link";

interface ChatMarkdownProps {
  content: string;
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  // Parse lines into blocks: code, table, list, paragraph
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentBlockType: "paragraph" | "code" | "table" | "list" | null = null;
  let codeContent: string[] = [];
  let codeLang = "";
  let tableRows: string[][] = [];
  let listItems: { text: string; ordered: boolean; num?: number }[] = [];
  let paragraphLines: string[] = [];

  const flush = (key: number) => {
    if (currentBlockType === "code") {
      blocks.push(
        <pre
          key={`code-${key}`}
          className="my-3 overflow-x-auto rounded-lg bg-zinc-900 p-4 font-mono text-xs text-zinc-100 dark:bg-zinc-950"
        >
          {codeLang && (
            <span className="mb-2 block text-[10px] uppercase tracking-wider text-zinc-500">
              {codeLang}
            </span>
          )}
          <code>{codeContent.join("\n")}</code>
        </pre>
      );
      codeContent = [];
      codeLang = "";
    } else if (currentBlockType === "table") {
      // Parse tableRows
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1).filter(
        (row) => !row.every((cell) => cell.trim().match(/^-+:*$/) || cell.trim() === "")
      );

      blocks.push(
        <div key={`table-wrapper-${key}`} className="my-3 overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-left text-xs">
            {headerRow && (
              <thead className="bg-muted text-muted-foreground font-semibold">
                <tr>
                  {headerRow.map((cell, idx) => (
                    <th key={`th-${idx}`} className="border-b border-border p-2">
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, rowIdx) => (
                <tr
                  key={`tr-${rowIdx}`}
                  className="hover:bg-muted/40 transition-colors border-b border-border last:border-0"
                >
                  {row.map((cell, colIdx) => (
                    <td key={`td-${rowIdx}-${colIdx}`} className="p-2 align-top">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    } else if (currentBlockType === "list") {
      const itemsNode = listItems.map((item, idx) => (
        <li key={`li-${idx}`} className="mb-1 last:mb-0 leading-relaxed pl-1">
          {renderInline(item.text)}
        </li>
      ));
      if (listItems[0]?.ordered) {
        blocks.push(
          <ol key={`ol-${key}`} className="my-2 list-decimal pl-6 text-sm">
            {itemsNode}
          </ol>
        );
      } else {
        blocks.push(
          <ul key={`ul-${key}`} className="my-2 list-disc pl-6 text-sm">
            {itemsNode}
          </ul>
        );
      }
      listItems = [];
    } else if (currentBlockType === "paragraph") {
      if (paragraphLines.length > 0) {
        const text = paragraphLines.join("\n").trim();
        if (text) {
          // Check for headers (e.g. # Header, ## Header)
          if (text.startsWith("### ")) {
            blocks.push(
              <h4 key={`h3-${key}`} className="mt-4 mb-2 text-sm font-semibold tracking-tight">
                {renderInline(text.substring(4))}
              </h4>
            );
          } else if (text.startsWith("## ")) {
            blocks.push(
              <h3 key={`h2-${key}`} className="mt-5 mb-2 text-base font-semibold tracking-tight text-foreground">
                {renderInline(text.substring(3))}
              </h3>
            );
          } else if (text.startsWith("# ")) {
            blocks.push(
              <h2 key={`h1-${key}`} className="mt-6 mb-3 text-lg font-bold tracking-tight text-foreground">
                {renderInline(text.substring(2))}
              </h2>
            );
          } else {
            blocks.push(
              <p key={`p-${key}`} className="mb-2 last:mb-0 text-sm leading-relaxed">
                {renderInline(text)}
              </p>
            );
          }
        }
        paragraphLines = [];
      }
    }
    currentBlockType = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check code blocks
    if (trimmed.startsWith("```")) {
      if (currentBlockType === "code") {
        flush(i);
      } else {
        flush(i);
        currentBlockType = "code";
        codeLang = trimmed.substring(3).trim();
      }
      continue;
    }

    if (currentBlockType === "code") {
      codeContent.push(line);
      continue;
    }

    // Check tables: starting and ending with | (or at least containing |)
    const isTableRow = line.includes("|") && trimmed.startsWith("|");
    if (isTableRow) {
      if (currentBlockType !== "table") {
        flush(i);
        currentBlockType = "table";
      }
      const cells = line
        .split("|")
        .slice(1, -1) // remove empty cells from edges
        .map((cell) => cell.trim());
      tableRows.push(cells);
      continue;
    } else if (currentBlockType === "table") {
      flush(i);
    }

    // Check lists
    const isUnorderedList = trimmed.startsWith("- ") || trimmed.startsWith("* ");
    const matchOrderedList = trimmed.match(/^(\d+)\.\s(.*)/);

    if (isUnorderedList) {
      if (currentBlockType !== "list" || (listItems.length > 0 && listItems[0].ordered)) {
        flush(i);
        currentBlockType = "list";
      }
      listItems.push({ text: trimmed.substring(2), ordered: false });
      continue;
    } else if (matchOrderedList) {
      if (currentBlockType !== "list" || (listItems.length > 0 && !listItems[0].ordered)) {
        flush(i);
        currentBlockType = "list";
      }
      listItems.push({
        text: matchOrderedList[2],
        ordered: true,
        num: parseInt(matchOrderedList[1], 10),
      });
      continue;
    } else if (currentBlockType === "list") {
      // If line is indented, it might be continuation of list item
      if (line.startsWith("  ") || line.startsWith("\t")) {
        if (listItems.length > 0) {
          listItems[listItems.length - 1].text += " " + trimmed;
        }
        continue;
      } else {
        flush(i);
      }
    }

    // If blank line, flush paragraph
    if (trimmed === "") {
      flush(i);
      continue;
    }

    // Standard paragraph line
    if (currentBlockType !== "paragraph") {
      flush(i);
      currentBlockType = "paragraph";
    }
    paragraphLines.push(line);
  }
  flush(lines.length);

  return <div className="space-y-2">{blocks}</div>;
}

// Function to render inline patterns: **bold**, *italic*, `code`, and [text](url)
function renderInline(text: string): React.ReactNode[] {
  // Regex to split into parts: bold, italic, code, links
  // Match patterns:
  // 1. Links: \[(.*?)\]\((.*?)\)
  // 2. Bold: \*\*(.*?)\*\*
  // 3. Italic: \*(.*?)\*
  // 4. Inline code: `(.*?)`
  const tokenRegex = /(\[.*?\]\(.*?\))|(\*\*.*?\*\*)|(\*.*?\*)|(`.*?`)/g;
  const parts = text.split(tokenRegex);
  
  return parts.map((part, idx) => {
    if (!part) return null;

    // Link: [label](url)
    if (part.startsWith("[") && part.includes("](")) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        const label = match[1];
        const url = match[2];
        
        // Use Link for internal routes, standard anchor for external
        if (url.startsWith("/")) {
          return (
            <Link
              key={`link-${idx}`}
              href={url}
              className="text-primary hover:underline font-medium transition-colors inline-flex items-center gap-0.5"
            >
              {label}
            </Link>
          );
        }
        return (
          <a
            key={`link-${idx}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium transition-colors inline-flex items-center gap-0.5"
          >
            {label}
          </a>
        );
      }
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`bold-${idx}`} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`italic-${idx}`}>{part.slice(1, -1)}</em>;
    }

    // Code: `text`
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`code-${idx}`}
          className="px-1.5 py-0.5 rounded bg-muted font-mono text-[13px] text-pink-600 dark:text-pink-400"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}
