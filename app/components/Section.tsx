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
        className="w-full flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors cursor-pointer"
      >
        <span className="text-xl sm:text-2xl">{icon}</span>
        <h2 className="text-base sm:text-xl font-bold text-[var(--heading)] flex-1 text-left">
          {title}
        </h2>
        <span
          className="text-[var(--muted)] transition-transform duration-200 text-sm"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        >
          ▼
        </span>
      </button>
      {open && (
        <div className="mt-2 sm:mt-3 px-3 sm:px-6 py-3 sm:py-5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden">
          <div className="min-w-0 overflow-x-auto">
            {children}
          </div>
        </div>
      )}
    </section>
  );
}
