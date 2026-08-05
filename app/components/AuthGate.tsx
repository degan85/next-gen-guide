"use client";

import { useState, useEffect } from "react";

const PASS_HASH = "a3c4b2e1d5f6"; // kblp2026

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(16).slice(0, 12).padEnd(12, "0");
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("ng-auth") === "1") {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (simpleHash(input) === simpleHash("kblp2026")) {
      sessionStorage.setItem("ng-auth", "1");
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setInput("");
    }
  };

  if (checking) return null;

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm mx-4 p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-6"
        >
          <div className="text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h1 className="text-xl font-bold text-[var(--heading)]">
              차세대 개발 가이드
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              비밀번호를 입력하세요
            </p>
          </div>
          <div>
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="비밀번호"
              autoFocus
              className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            {error && (
              <p className="text-sm text-[var(--danger)] mt-2">
                비밀번호가 틀렸습니다
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[var(--accent)] text-[var(--background)] font-medium hover:bg-[var(--accent-dim)] transition-colors cursor-pointer"
          >
            로그인
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
