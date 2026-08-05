"use client";

import { useState } from "react";

export function Section({
  id,
  icon,
  title,
  children,
  defaultOpen = false,
}: {
  id: string;
  icon: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className="scroll-mt-20">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors cursor-pointer"
      >
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-bold text-[var(--heading)] flex-1 text-left">
          {title}
        </h2>
        <span
          className="text-[var(--muted)] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        >
          ▼
        </span>
      </button>
      {open && (
        <div className="mt-3 px-6 py-5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-5">
          {children}
        </div>
      )}
    </section>
  );
}

export function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--accent)] mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--card-border)]">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left py-2 px-3 text-[var(--muted)] font-medium"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[var(--card-border)]/50 hover:bg-[var(--background)]/50"
            >
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3">
                  <code className="text-sm">{cell}</code>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CodeBlock({
  title,
  children,
}: {
  title?: string;
  children: string;
}) {
  return (
    <div>
      {title && (
        <p className="text-xs font-medium text-[var(--muted)] mb-1 uppercase tracking-wide">
          {title}
        </p>
      )}
      <pre className="text-[var(--foreground)]">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function Badge({
  children,
  color = "accent",
}: {
  children: React.ReactNode;
  color?: "accent" | "success" | "warning" | "danger";
}) {
  const colors = {
    accent: "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30",
    success: "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
    warning: "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
    danger: "bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/30",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}
    >
      {children}
    </span>
  );
}
