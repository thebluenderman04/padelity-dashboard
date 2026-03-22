"use client";

import { useState } from "react";

const MYR = (n: number) =>
  "MYR " + Math.round(n).toLocaleString("en-MY");

interface Props {
  estimatedImpressions: number;
}

export default function EMVCard({ estimatedImpressions }: Props) {
  const [cpm, setCpm] = useState(25);

  const emv = (estimatedImpressions / 1000) * cpm;

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-ink">Earned Media Value</h2>
        <p className="text-xs text-ink-muted mt-0.5">Equivalent paid media value</p>
      </div>

      <div className="mb-5">
        <p className="text-3xl font-display font-semibold text-ink tracking-tight">
          {MYR(emv)}
        </p>
        <p className="text-xs text-ink-muted mt-1">
          {estimatedImpressions.toLocaleString()} est. impressions × MYR {cpm} CPM
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-xs text-ink-muted">CPM (MYR)</span>
        <input
          type="number"
          min={1}
          max={500}
          step={1}
          value={cpm}
          onChange={(e) => setCpm(parseFloat(e.target.value) || 25)}
          className="w-20 text-xs text-center border border-border rounded-lg px-2 py-1 bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
      </div>
    </div>
  );
}
