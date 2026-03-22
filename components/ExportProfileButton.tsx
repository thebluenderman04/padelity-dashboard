"use client";

import { useState } from "react";
import { Download } from "lucide-react";

interface TopPost {
  rank: number;
  likes: number;
  comments: number;
  engRate: number;
  type: string;
  date: string;
}

interface Props {
  athleteName: string;
  handle: string;
  followers: number;
  engagementRate: number;
  estimatedImpressions: number;
  topPosts: TopPost[];
}

const MYR = (n: number) => "MYR " + Math.round(n).toLocaleString("en-MY");
const fmt = (n: number) => n.toLocaleString("en-MY");

const BENCHMARKS = [
  { label: "SEA Sports Creator", value: 0.8 },
  { label: "MY Lifestyle Creator", value: 1.2 },
];

const RANKING_TIERS = [
  { value: "n1", label: "National #1", multiplier: 1.5 },
  { value: "top5", label: "Top 5", multiplier: 1.25 },
  { value: "top10", label: "Top 10", multiplier: 1.1 },
  { value: "none", label: "Unranked", multiplier: 1.0 },
];

export default function ExportProfileButton({
  athleteName,
  handle,
  followers,
  engagementRate,
  estimatedImpressions,
  topPosts,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W = 210;
      const MARGIN = 18;
      const COL = W - MARGIN * 2;
      let y = 0;

      // ── Color helpers ──────────────────────────────────────────────────────
      const BLACK = [10, 10, 10] as [number, number, number];
      const GRAY  = [120, 118, 112] as [number, number, number];
      const LIGHT = [240, 239, 236] as [number, number, number];
      const GREEN_BG = [236, 253, 245] as [number, number, number];
      const GREEN_TEXT = [6, 95, 70] as [number, number, number];
      const RED_BG = [254, 242, 242] as [number, number, number];
      const RED_TEXT = [153, 27, 27] as [number, number, number];

      // ── Header bar ────────────────────────────────────────────────────────
      doc.setFillColor(...BLACK);
      doc.rect(0, 0, W, 32, "F");

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(athleteName, MARGIN, 15);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 178, 172);
      doc.text(`@${handle}  ·  Athlete Commercial Profile`, MARGIN, 22);
      doc.text(`Generated ${new Date().toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}`, MARGIN, 28);

      y = 42;

      // ── KPI row ───────────────────────────────────────────────────────────
      const kpis = [
        { label: "Followers",      value: fmt(followers) },
        { label: "Engagement Rate",value: `${engagementRate.toFixed(2)}%` },
        { label: "Est. Impressions",value: fmt(estimatedImpressions) },
      ];

      const kpiW = COL / 3;
      kpis.forEach(({ label, value }, i) => {
        const x = MARGIN + i * kpiW;
        doc.setFillColor(...LIGHT);
        doc.roundedRect(x, y, kpiW - 3, 22, 3, 3, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY);
        doc.text(label.toUpperCase(), x + 5, y + 7);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BLACK);
        doc.text(value, x + 5, y + 17);
      });

      y += 30;

      // ── Sponsorship Valuation ─────────────────────────────────────────────
      sectionHeader(doc, "SPONSORSHIP VALUATION (MONTHLY · MYR)", MARGIN, y, COL, BLACK, GRAY);
      y += 9;

      const engRate = engagementRate / 100;
      const base = followers * engRate * 1.4 * RANKING_TIERS[3].multiplier;
      const rateRows = [
        { label: "Floor",   value: MYR(base * 0.7),  note: "conservative" },
        { label: "Mid",     value: MYR(base),         note: "recommended"  },
        { label: "Ceiling", value: MYR(base * 1.3),   note: "premium"      },
      ];
      const rW = COL / 3;
      rateRows.forEach(({ label, value, note }, i) => {
        const x = MARGIN + i * rW;
        doc.setFillColor(...LIGHT);
        doc.roundedRect(x, y, rW - 3, 22, 3, 3, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY);
        doc.text(label.toUpperCase(), x + 5, y + 7);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BLACK);
        doc.text(value, x + 5, y + 15);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY);
        doc.text(note, x + 5, y + 20);
      });
      y += 30;

      // ── EMV ───────────────────────────────────────────────────────────────
      const emv = (estimatedImpressions / 1000) * 25;
      sectionHeader(doc, "EARNED MEDIA VALUE", MARGIN, y, COL, BLACK, GRAY);
      y += 9;
      doc.setFillColor(...LIGHT);
      doc.roundedRect(MARGIN, y, COL, 18, 3, 3, "F");
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BLACK);
      doc.text(MYR(emv), MARGIN + 5, y + 11);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY);
      doc.text(`${fmt(estimatedImpressions)} est. impressions × MYR 25 CPM`, MARGIN + 60, y + 11);
      y += 26;

      // ── Benchmark Comparison ──────────────────────────────────────────────
      sectionHeader(doc, "BENCHMARK COMPARISON", MARGIN, y, COL, BLACK, GRAY);
      y += 9;

      BENCHMARKS.forEach(({ label, value }) => {
        const above = engagementRate >= value;
        const diff = Math.abs(engagementRate - value).toFixed(2);
        const [bg, fg] = above ? [GREEN_BG, GREEN_TEXT] : [RED_BG, RED_TEXT];

        doc.setFillColor(...LIGHT);
        doc.roundedRect(MARGIN, y, COL - 40, 14, 2, 2, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY);
        doc.text(label, MARGIN + 4, y + 6);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BLACK);
        doc.text(`${value.toFixed(1)}%`, MARGIN + 4, y + 11);

        doc.setFillColor(...bg);
        doc.roundedRect(W - MARGIN - 38, y, 38, 14, 2, 2, "F");
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...fg);
        doc.text(`${above ? "+" : "-"}${diff}%`, W - MARGIN - 19, y + 9, { align: "center" });

        y += 18;
      });

      y += 4;

      // ── Top 3 Posts ───────────────────────────────────────────────────────
      if (topPosts.length > 0) {
        sectionHeader(doc, "TOP 3 POSTS BY ENGAGEMENT", MARGIN, y, COL, BLACK, GRAY);
        y += 9;

        topPosts.slice(0, 3).forEach((post, i) => {
          doc.setFillColor(...LIGHT);
          doc.roundedRect(MARGIN, y, COL, 16, 2, 2, "F");
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...BLACK);
          doc.text(`#${i + 1}  ${post.type}`, MARGIN + 4, y + 7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...GRAY);
          doc.text(post.date, MARGIN + 4, y + 12);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(...BLACK);
          doc.text(`${post.engRate.toFixed(2)}% eng.`, W - MARGIN - 4, y + 7, { align: "right" });
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...GRAY);
          doc.text(`${fmt(post.likes)} likes · ${fmt(post.comments)} comments`, W - MARGIN - 4, y + 12, { align: "right" });

          y += 20;
        });
      }

      // ── Footer ────────────────────────────────────────────────────────────
      y = 280;
      doc.setFillColor(...LIGHT);
      doc.rect(0, y, W, 17, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY);
      doc.text("Padelity Analytics  ·  padelitydashboard.vercel.app  ·  Confidential", W / 2, y + 10, { align: "center" });

      // Save
      doc.save(`${athleteName.replace(/\s+/g, "-")}-commercial-profile.pdf`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-ink-muted hover:text-ink hover:border-ink/30 transition-colors disabled:opacity-40"
    >
      <Download size={14} strokeWidth={2} />
      {loading ? "Generating…" : "Export Profile"}
    </button>
  );
}

// ── Helper: section header line ────────────────────────────────────────────────
function sectionHeader(
  doc: import("jspdf").jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  black: [number, number, number],
  gray: [number, number, number]
) {
  doc.setDrawColor(...gray);
  doc.setLineWidth(0.3);
  doc.line(x, y + 3, x + width, y + 3);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...black);
  // Draw text on white background to "cut" the line
  const tw = doc.getTextWidth(text);
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y - 1, tw + 4, 6, "F");
  doc.text(text, x + 2, y + 3.5);
}
