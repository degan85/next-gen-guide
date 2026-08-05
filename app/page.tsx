"use client";

import { sections } from "../content/sections";
import AuthGate from "./components/AuthGate";
import Sidebar from "./components/Sidebar";
import { Section } from "./components/Section";
import MarkdownRenderer from "./components/MarkdownRenderer";

export default function Home() {
  return (
    <AuthGate>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <Sidebar sections={sections} />

        <main className="flex-1 lg:ml-64 min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--card-border)] px-3 sm:px-8 py-3 sm:py-4">
            <div className="max-w-4xl mx-auto pl-11 lg:pl-0">
              <h1 className="text-base sm:text-2xl font-bold text-[var(--heading)]">
                차세대 시스템 개발 가이드
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted)]">
                v0.2 · 엑스솔콥코리아 소스코드 표준
              </p>
            </div>
          </header>

          <div className="max-w-4xl mx-auto px-3 sm:px-8 py-4 sm:py-8 space-y-3 sm:space-y-4">
            {sections.map((s) => (
              <Section
                key={s.id}
                id={s.id}
                icon={s.icon}
                title={s.title}
                defaultOpen={s.defaultOpen}
              >
                <MarkdownRenderer content={s.content} />
              </Section>
            ))}

            <footer className="text-center py-6 sm:py-8 text-xs sm:text-sm text-[var(--muted)]">
              <p>KB라이프파트너스 차세대 시스템 개발 표준 가이드라인</p>
              <p className="mt-1">
                원본: 엑스솔콥코리아 소스코드 표준 개발 가이드라인 v0.2
                (2026-04-14)
              </p>
            </footer>
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
