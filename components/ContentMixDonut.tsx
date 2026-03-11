"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import type { ContentSlice } from "../lib/mock-data";

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div
      className="bg-surface border border-border rounded-xl px-3 py-2 text-xs"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
    >
      <p className="font-semibold text-ink">{d.name}</p>
      <p className="text-ink-muted">{d.value}% of posts</p>
    </div>
  );
}

export default function ContentMixDonut({ data }: { data: ContentSlice[] }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={82}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs text-ink-muted">{d.name}</span>
            <span className="text-xs font-medium text-ink ml-auto">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
