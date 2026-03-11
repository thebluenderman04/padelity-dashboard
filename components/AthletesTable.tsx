"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { fmt, fmtPct } from "../lib/utils";
import type { AthleteStats } from "../lib/mock-data";

type SortKey = keyof Pick<
  AthleteStats,
  "ranking" | "followers" | "engagementRate" | "reach" | "postsLast30" | "avgLikes"
>;

interface Props {
  athletes: AthleteStats[];
}

function SortIcon({ col, active, dir }: { col: string; active: string; dir: "asc" | "desc" }) {
  if (active !== col) return <ChevronsUpDown size={13} className="text-ink-subtle" />;
  return dir === "asc" ? (
    <ChevronUp size={13} className="text-ink" />
  ) : (
    <ChevronDown size={13} className="text-ink" />
  );
}

const COLS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "ranking",        label: "Rank",        align: "right" },
  { key: "followers",      label: "Followers",   align: "right" },
  { key: "engagementRate", label: "Eng. Rate",   align: "right" },
  { key: "reach",          label: "Avg. Reach",  align: "right" },
  { key: "postsLast30",    label: "Posts (30d)", align: "right" },
  { key: "avgLikes",       label: "Avg. Likes",  align: "right" },
];

export default function AthletesTable({ athletes }: Props) {
  const [sortCol, setSortCol] = useState<SortKey>("ranking");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(col: SortKey) {
    if (col === sortCol) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir(col === "ranking" ? "asc" : "desc");
    }
  }

  const sorted = [...athletes].sort((a, b) => {
    const av = a[sortCol] as number;
    const bv = b[sortCol] as number;
    return sortDir === "asc" ? av - bv : bv - av;
  });

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[680px]">
        <thead>
          <tr className="border-b border-border">
            {/* Athlete column (not sortable) */}
            <th className="text-left pb-3 pr-4 text-[11px] font-medium text-ink-muted uppercase tracking-[0.08em] whitespace-nowrap">
              Athlete
            </th>
            {COLS.map(({ key, label }) => (
              <th
                key={key}
                className="pb-3 px-3 text-right cursor-pointer select-none group whitespace-nowrap"
                onClick={() => handleSort(key)}
              >
                <span className="inline-flex items-center gap-1 justify-end text-[11px] font-medium text-ink-muted uppercase tracking-[0.08em] group-hover:text-ink transition-colors">
                  {label}
                  <SortIcon col={key} active={sortCol} dir={sortDir} />
                </span>
              </th>
            ))}
            <th className="pb-3 pl-3 text-right text-[11px] font-medium text-ink-muted uppercase tracking-[0.08em]">
              Trend
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {sorted.map((a) => {
            const engUp = a.engagementRate >= a.engagementRatePrev;
            return (
              <tr key={a.id} className="hover:bg-canvas/60 transition-colors">
                {/* Athlete identity */}
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar placeholder */}
                    <div className="w-9 h-9 rounded-full bg-ink/8 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-ink">
                      {a.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-ink leading-tight">{a.name}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{a.displayUsername}</p>
                    </div>
                  </div>
                </td>

                {/* Rank */}
                <td className="py-4 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-ink-muted text-xs">{a.flag}</span>
                    <span className="font-medium text-ink">#{a.ranking}</span>
                  </div>
                </td>

                {/* Followers */}
                <td className="py-4 px-3 text-right">
                  <p className="font-medium text-ink">{fmt(a.followers)}</p>
                  <p className="text-xs text-positive mt-0.5">+{a.followersGrowth}%</p>
                </td>

                {/* Engagement rate */}
                <td className="py-4 px-3 text-right">
                  <span className="font-medium text-ink">{fmtPct(a.engagementRate)}</span>
                </td>

                {/* Reach */}
                <td className="py-4 px-3 text-right">
                  <span className="font-medium text-ink">{fmt(a.reach)}</span>
                </td>

                {/* Posts 30d */}
                <td className="py-4 px-3 text-right">
                  <span className="font-medium text-ink">{a.postsLast30}</span>
                </td>

                {/* Avg likes */}
                <td className="py-4 px-3 text-right">
                  <span className="font-medium text-ink">{fmt(a.avgLikes)}</span>
                </td>

                {/* Trend */}
                <td className="py-4 pl-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      engUp
                        ? "bg-emerald-50 text-positive"
                        : "bg-red-50 text-negative"
                    }`}
                  >
                    {engUp ? (
                      <TrendingUp size={11} strokeWidth={2.5} />
                    ) : (
                      <TrendingDown size={11} strokeWidth={2.5} />
                    )}
                    {engUp ? "+" : ""}
                    {(a.engagementRate - a.engagementRatePrev).toFixed(1)}pp
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
