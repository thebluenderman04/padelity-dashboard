"use client";

import { useState } from "react";
import { Sparkles, Download, RefreshCw, ShieldCheck, AlertTriangle, XCircle, Tag } from "lucide-react";
import type { CommercialProfileResult } from "../lib/commercial-profile";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMYR(n: number): string {
  if (n >= 1000000) return `RM ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `RM ${(n / 1000).toFixed(1)}k`;
  return `RM ${Math.round(n)}`;
}

function ScoreBar({
  label,
  value,
  max,
  note,
}: {
  label: string;
  value: number;
  max: number;
  note?: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-ink-muted">
          {label}
          {note && <span className="text-ink-subtle ml-1 text-[10px]">({note})</span>}
        </span>
        <span className="text-xs font-semibold text-ink tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-ink rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const SAFETY_STYLES: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
  Green: {
    icon: <ShieldCheck size={13} strokeWidth={2.5} />,
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Brand Safe",
  },
  Amber: {
    icon: <AlertTriangle size={13} strokeWidth={2.5} />,
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Review Required",
  },
  Red: {
    icon: <XCircle size={13} strokeWidth={2.5} />,
    cls: "bg-red-50 text-red-700 border-red-200",
    label: "Flagged",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  igUserId: string;
  brandId: string;
  athleteName: string;
  // Current live stats (from Instagram API, passed from server component)
  liveStats: {
    followers: number;
    avg_engagement_rate: number;
    avg_likes: number;
    posting_frequency_30d: number;
  };
  initialProfile: CommercialProfileResult | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CommercialProfilePanel({
  igUserId,
  brandId,
  athleteName,
  liveStats,
  initialProfile,
}: Props) {
  const [profile, setProfile] = useState<CommercialProfileResult | null>(initialProfile);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    try {
      // Step 1: snapshot
      const snapRes = await fetch(`/api/athletes/${igUserId}/snapshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: brandId }),
      });
      if (!snapRes.ok) throw new Error("Snapshot failed");
      const { snapshotId, stats } = await snapRes.json();

      // Step 2: commercial profile
      const profileRes = await fetch(`/api/athletes/${igUserId}/commercial-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: brandId, snapshotId, stats }),
      });
      if (!profileRes.ok) throw new Error("Profile generation failed");
      const newProfile = await profileRes.json();

      setProfile(newProfile);
      showToast("Commercial brief generated successfully");
    } catch (err) {
      console.error("[generate]", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownload() {
    // PDF generation placeholder — will be wired to a real PDF service
    console.log("[PDF] Download requested for", athleteName, profile);
    showToast("PDF download coming soon — check back shortly!");
  }

  const safety = profile
    ? SAFETY_STYLES[profile.brand_safety_rating] ?? SAFETY_STYLES.Green
    : null;

  return (
    <div className="space-y-4">
      {/* ── No profile yet ──────────────────────────────────────────────────── */}
      {!profile && (
        <div
          className="bg-surface rounded-2xl p-8 flex flex-col items-center text-center"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <div className="w-12 h-12 rounded-2xl bg-ink/6 flex items-center justify-center mb-4">
            <Sparkles size={22} className="text-ink-muted" />
          </div>
          <h3 className="font-semibold text-ink mb-1">No commercial profile yet</h3>
          <p className="text-sm text-ink-muted mb-6 max-w-sm">
            Generate a rate card and audience value score based on{" "}
            {athleteName}&apos;s latest Instagram performance data.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white text-sm font-medium rounded-xl hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {isGenerating ? "Generating…" : "Generate Brief"}
          </button>
          {error && <p className="text-xs text-negative mt-3">{error}</p>}
        </div>
      )}

      {/* ── Profile exists ──────────────────────────────────────────────────── */}
      {profile && (
        <>
          {/* Rate card + Score — two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Rate card */}
            <div
              className="lg:col-span-2 bg-surface rounded-2xl p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
            >
              <h2 className="text-base font-semibold text-ink mb-5">Rate Card</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-[11px] font-medium text-ink-muted uppercase tracking-[0.08em]">
                      Format
                    </th>
                    <th className="text-right pb-3 text-[11px] font-medium text-ink-muted uppercase tracking-[0.08em]">
                      Low
                    </th>
                    <th className="text-right pb-3 text-[11px] font-medium text-ink-muted uppercase tracking-[0.08em]">
                      High
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    {
                      label: "Post",
                      low: profile.post_rate_low,
                      high: profile.post_rate_high,
                    },
                    {
                      label: "Story",
                      low: profile.story_rate_low,
                      high: profile.story_rate_high,
                    },
                    {
                      label: "Reel",
                      low: profile.reel_rate_low,
                      high: profile.reel_rate_high,
                    },
                    {
                      label: "Campaign Bundle",
                      low: profile.campaign_rate_low,
                      high: profile.campaign_rate_high,
                      note: "4 posts · 8 stories · 2 reels · 4 weeks",
                    },
                  ].map(({ label, low, high, note }) => (
                    <tr key={label}>
                      <td className="py-3.5">
                        <p className="font-medium text-ink">{label}</p>
                        {note && (
                          <p className="text-[11px] text-ink-subtle mt-0.5">{note}</p>
                        )}
                      </td>
                      <td className="py-3.5 text-right font-medium text-ink tabular-nums">
                        {fmtMYR(low)}
                      </td>
                      <td className="py-3.5 text-right font-medium text-ink tabular-nums">
                        {fmtMYR(high)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-ink-subtle mt-4">
                All rates in Malaysian Ringgit (MYR) · indicative ranges only
              </p>
            </div>

            {/* Audience Value Score */}
            <div
              className="bg-surface rounded-2xl p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
            >
              <h2 className="text-base font-semibold text-ink mb-5">
                Audience Value Score
              </h2>

              {/* Big score */}
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-display font-semibold text-ink leading-none">
                  {profile.audience_value_score}
                </span>
                <span className="text-xl text-ink-muted mb-0.5">/100</span>
              </div>

              {/* Overall bar */}
              <div className="h-2 bg-border rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-ink rounded-full transition-all duration-700"
                  style={{ width: `${profile.audience_value_score}%` }}
                />
              </div>

              {/* Breakdown */}
              <div className="space-y-4">
                <ScoreBar
                  label="Engagement Rate"
                  value={profile.score_breakdown.engagement}
                  max={40}
                />
                <ScoreBar
                  label="Follower Count"
                  value={profile.score_breakdown.followers}
                  max={20}
                />
                <ScoreBar
                  label="Posting Consistency"
                  value={profile.score_breakdown.posting}
                  max={20}
                />
                <ScoreBar
                  label="Authenticity"
                  value={profile.score_breakdown.authenticity}
                  max={20}
                  note="placeholder"
                />
              </div>
            </div>
          </div>

          {/* Brand Fit + Safety */}
          <div
            className="bg-surface rounded-2xl p-6 flex flex-col sm:flex-row sm:items-start gap-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
          >
            {/* Brand fit tags */}
            <div className="flex-1">
              <h2 className="text-base font-semibold text-ink mb-3">Brand Fit</h2>
              <div className="flex flex-wrap gap-2">
                {profile.brand_fit_tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-canvas border border-border text-ink"
                  >
                    <Tag size={10} strokeWidth={2.5} className="text-ink-muted" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Safety badge */}
            <div>
              <h2 className="text-base font-semibold text-ink mb-3">Brand Safety</h2>
              {safety && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${safety.cls}`}
                >
                  {safety.icon}
                  {safety.label}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink-muted border border-border rounded-xl hover:border-ink-muted hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <RefreshCw size={13} />
              )}
              {isGenerating ? "Regenerating…" : "Regenerate"}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white text-sm font-medium rounded-xl hover:bg-ink/90 transition-colors"
            >
              <Download size={13} />
              Download PDF
            </button>

            {error && <p className="text-xs text-negative">{error}</p>}
          </div>

          <p className="text-[11px] text-ink-subtle">
            Generated{" "}
            {new Date(profile.generated_at).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
