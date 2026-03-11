import { TrendingUp, TrendingDown } from "lucide-react";
import { fmt, fmtPct } from "../lib/utils";

interface Props {
  label: string;
  value: number;
  /** Change amount in percent points */
  changePct?: number;
  /** Change in absolute percentage points (e.g. engagement rate delta) */
  changePp?: number;
  /** If true, formats the value as a percentage */
  isPercent?: boolean;
  /** Optional unit prefix (e.g. "$") */
  prefix?: string;
}

export default function KPICard({
  label,
  value,
  changePct,
  changePp,
  isPercent = false,
  prefix = "",
}: Props) {
  const change = changePct ?? changePp;
  const isPositive = (change ?? 0) >= 0;

  const displayValue = isPercent
    ? fmtPct(value)
    : `${prefix}${fmt(value)}`;

  const changeLabel =
    changePp !== undefined
      ? `${isPositive ? "+" : ""}${changePp.toFixed(2)}pp`
      : changePct !== undefined
      ? `${isPositive ? "+" : ""}${changePct.toFixed(1)}%`
      : null;

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
    >
      <p className="text-[11px] font-medium text-ink-muted uppercase tracking-[0.1em] mb-3">
        {label}
      </p>

      <p className="text-[2rem] leading-none font-display font-semibold text-ink tracking-tight">
        {displayValue}
      </p>

      {changeLabel && (
        <div
          className={`flex items-center gap-1 mt-3 text-xs font-medium ${
            isPositive ? "text-positive" : "text-negative"
          }`}
        >
          {isPositive ? (
            <TrendingUp size={13} strokeWidth={2.5} />
          ) : (
            <TrendingDown size={13} strokeWidth={2.5} />
          )}
          <span>
            {changeLabel} vs last month
          </span>
        </div>
      )}
    </div>
  );
}
