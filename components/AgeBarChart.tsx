"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  TooltipProps,
  Cell,
} from "recharts";
import type { AgeGroup } from "../lib/mock-data";

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-surface border border-border rounded-xl px-3 py-2 text-xs"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
    >
      <p className="font-semibold text-ink">{label}</p>
      <p className="text-ink-muted">{payload[0].value}% of audience</p>
    </div>
  );
}

export default function AgeBarChart({ data }: { data: AgeGroup[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
        barCategoryGap="28%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e7e4" horizontal={false} />

        <XAxis
          type="number"
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 40]}
        />

        <YAxis
          type="category"
          dataKey="group"
          tick={{ fill: "#6b7280", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={44}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f7f6f3" }} />

        <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i === 2 ? "#0a0a0a" : i === 1 || i === 3 ? "#6b7280" : "#d1d5db"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
