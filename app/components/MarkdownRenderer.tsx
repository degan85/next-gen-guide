"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h3: ({ children }) => (
          <h3 className="text-base sm:text-lg font-semibold text-[var(--accent)] mt-5 mb-2 first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-sm sm:text-base text-[var(--muted)] mb-3 leading-relaxed">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="text-[var(--foreground)] font-semibold">
            {children}
          </strong>
        ),
        ul: ({ children }) => (
          <ul className="space-y-1 mb-3 text-sm sm:text-base">{children}</ul>
        ),
        li: ({ children }) => (
          <li className="text-[var(--muted)] pl-1 flex gap-2">
            <span className="flex-none">•</span>
            <span>{children}</span>
          </li>
        ),
        pre: ({ children }) => (
          <pre className="!text-xs sm:!text-sm mb-3 overflow-x-auto">
            {children}
          </pre>
        ),
        code: ({ className, children }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return <code className="text-[var(--foreground)]">{children}</code>;
          }
          return (
            <code className="bg-[var(--card-border)] px-1.5 py-0.5 rounded text-xs sm:text-sm text-[var(--accent)]">
              {children}
            </code>
          );
        },
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-xs sm:text-sm">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-[var(--card-border)]">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="text-left py-2 px-2 sm:px-3 text-[var(--muted)] font-medium whitespace-nowrap">
            {children}
          </th>
        ),
        tr: ({ children }) => (
          <tr className="border-b border-[var(--card-border)]/50">
            {children}
          </tr>
        ),
        td: ({ children }) => (
          <td className="py-1.5 sm:py-2 px-2 sm:px-3 text-[var(--foreground)]">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
