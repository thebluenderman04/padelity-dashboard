"use client";

import { useState } from "react";

const RANKING_TIERS = [
  { label: "National #1",  value: "n1",   multiplier: 1.5  },
  { label: "Top 5",        value: "top5", multiplier: 1.25 },
  { label: "Top 10",       value: "top10",multiplier: 1.1  },
  { label: "Unranked",     value: "none", multiplier: 1.0  },
];

const MYR = (n: number) =>
  "MYR " + Math.round(n).toLocaleString("en-MY");

interface Props {
  followers: number;
  engagementRate: number; // percent, e.g. 3.2
}

export default function SponsorshipValuationCard({ followers, engagementRate }: Props) {
  const [rankingTier, setRankingTier] = useState("none");
  const [sportMultiplier, setSportMultiplier] = useState(1.4);

  const tier = RANKING_TIERS.find((t) => t.value === rankingTier)!;
  const engRate = engagementRate / 100;
  const base = followers * engRate * sportMultiplier * tier.multiplier;
  const floor   = base * 0.7;
  const ceiling = base * 1.3;

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-semibold text-ink">Sponsorship Valuation</h2>
          <p className="text-xs text-ink-muted mt-0.5">Monthly rate card · MYR</p>
        </div>
        {/* Ranking tier select */}
        <select
          value={rankingTier}
          onChange={(e) => setRankingTier(e.target.value)}
          className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
        >
          {RANKING_TIERS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Rate tiers */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Floor",   value: floor,   note: "conservative" },
          { label: "Mid",     value: base,    note: "recommended"  },
          { label: "Ceiling", value: ceiling, note: "premium"      },
        ].map(({ label, value, note }) => (
          <div key={label} className="bg-canvas rounded-xl p-3 text-center">
            <p className="text-[10px] text-ink-muted uppercase tracking-[0.1em] mb-1">{label}</p>
            <p className="text-sm font-semibold text-ink leading-tight">{MYR(value)}</p>
            <p className="text-[10px] text-ink-subtle mt-0.5">{note}</p>
          </div>
        ))}
      </div>

      {/* Sport growth multiplier */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-xs text-ink-muted">Sport growth multiplier</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0.5}
            max={3}
            step={0.1}
            value={sportMultiplier}
            onChange={(e) => setSportMultiplier(parseFloat(e.target.value) || 1)}
            className="w-16 text-xs text-center border border-border rounded-lg px-2 py-1 bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
          <span className="text-xs text-ink-subtle">× (padel MY)</span>
        </div>
      </div>
    </div>
  );
}
