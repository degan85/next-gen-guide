"use client";

import { useState } from "react";
import { SectionData } from "../../content/sections";

export default function Sidebar({ sections }: { sections: SectionData[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center cursor-pointer"
        aria-label="메뉴"
      >
        <span className="text-lg">{open ? "✕" : "☰"}</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full bg-[var(--card-bg)] border-r border-[var(--card-border)] p-6 gap-1 z-40 flex flex-col w-64 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="mb-8 mt-8 lg:mt-0">
          <h1 className="text-lg font-bold text-[var(--heading)]">
            차세대 개발 가이드
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">KB라이프파트너스</p>
        </div>
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
          >
            <span>{s.icon}</span>
            {s.title}
          </a>
        ))}
      </nav>
    </>
  );
}
