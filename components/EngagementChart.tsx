"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { fmt } from "../lib/utils";
import type { EngagementPoint } from "../lib/mock-data";

interface TooltipLabels {
  metric2?: string;
  metric3?: string;
}

function makeTooltip(labels: TooltipLabels) {
  return function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload as EngagementPoint;
    return (
      <div
        className="bg-surface border border-border rounded-xl px-4 py-3 text-xs"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
      >
        <p className="font-semibold text-ink mb-2">{label}</p>
        <div className="space-y-1 text-ink-muted">
          <p>
            Engagement{" "}
            <span className="text-ink font-medium">{d.engagement}%</span>
          </p>
          {d.reach > 0 && (
            <p>
              {labels.metric2 ?? "Reach"}{" "}
              <span className="text-ink font-medium">{fmt(d.reach)}</span>
            </p>
          )}
          {d.impressions > 0 && (
            <p>
              {labels.metric3 ?? "Impressions"}{" "}
              <span className="text-ink font-medium">{fmt(d.impressions)}</span>
            </p>
          )}
        </div>
      </div>
    );
  };
}

interface Props {
  data: EngagementPoint[];
  tooltipLabels?: TooltipLabels;
}

export default function EngagementChart({ data, tooltipLabels = {} }: Props) {
  const CustomTooltip = makeTooltip(tooltipLabels);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0a0a0a" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#0a0a0a" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e8e7e4"
          vertical={false}
        />

        <XAxis
          dataKey="date"
          tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "var(--font-dm-sans)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />

        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "var(--font-dm-sans)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={["auto", "auto"]}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e8e7e4", strokeWidth: 1 }} />

        <Area
          type="monotone"
          dataKey="engagement"
          stroke="#0a0a0a"
          strokeWidth={2}
          fill="url(#engGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#0a0a0a", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
