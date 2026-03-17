"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OnboardContent() {
  const params = useSearchParams();
  const success = params.get("success") === "1";
  const username = params.get("username") ?? "";
  const uid = params.get("uid") ?? "";
  const errorMsg = params.get("error") ?? "";
  const brand = params.get("brand") ?? "padelity";

  const [athleteName, setAthleteName] = useState("");

  // Pre-fill name from URL if provided (e.g. /onboard?name=Aidan+Yunus)
  useEffect(() => {
    const name = params.get("name");
    if (name) setAthleteName(name);
  }, [params]);

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ink mb-5">
            <span className="text-white text-xl font-display font-semibold">P</span>
          </div>
          <h1 className="text-3xl font-display font-semibold text-ink tracking-tight">
            Athlete Onboarding
          </h1>
          <p className="text-ink-muted text-sm mt-2">
            Connect your Instagram account to Padelity Analytics
          </p>
        </div>

        <div
          className="bg-surface rounded-2xl p-8"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}
        >
          {success ? (
            /* ── Success state ── */
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50 mb-2">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-ink font-medium">
                @{username} connected successfully!
              </p>
              <p className="text-ink-muted text-sm">
                Your Instagram account has been connected. You&apos;ll appear on the dashboard automatically.
              </p>
              {uid && (
                <p className="text-xs text-ink-subtle font-mono bg-canvas rounded-lg px-3 py-2 break-all">
                  ig_user_id: {uid}
                </p>
              )}
            </div>
          ) : (
            /* ── Connect form ── */
            <div className="space-y-5">
              {errorMsg && (
                <p className="text-negative text-sm text-center bg-red-50 rounded-lg py-2 px-3">
                  {decodeURIComponent(errorMsg)}
                </p>
              )}

              <div>
                <label
                  htmlFor="athleteName"
                  className="block text-xs font-medium text-ink-muted uppercase tracking-widest mb-2"
                >
                  Your Name
                </label>
                <input
                  id="athleteName"
                  type="text"
                  value={athleteName}
                  onChange={(e) => setAthleteName(e.target.value)}
                  placeholder="e.g. Aidan Yunus"
                  className="w-full h-11 px-3 rounded-xl border border-border bg-canvas text-ink text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                />
              </div>

              <a
                href={`/api/auth/instagram?athlete=${encodeURIComponent(athleteName)}&brand=${brand}`}
                className={`flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-ink text-white text-sm font-medium tracking-wide hover:bg-zinc-800 active:bg-zinc-900 transition-colors ${
                  !athleteName.trim() ? "opacity-50 pointer-events-none" : ""
                }`}
                aria-disabled={!athleteName.trim()}
              >
                {/* Instagram icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Connect Instagram
              </a>

              <p className="text-center text-xs text-ink-subtle">
                You&apos;ll be redirected to Instagram to approve access.
                <br />
                Only your profile and media are read — no posting.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-ink-subtle mt-8">
          Padelity Analytics · Athlete Portal
        </p>
      </div>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <Suspense>
      <OnboardContent />
    </Suspense>
  );
}
