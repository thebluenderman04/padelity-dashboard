import type { CountryRow } from "../lib/mock-data";

export default function CountriesChart({ data }: { data: CountryRow[] }) {
  const max = Math.max(...data.map((d) => d.pct));

  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div key={row.country}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">{row.flag}</span>
              <span className="text-sm text-ink font-medium">{row.country}</span>
            </div>
            <span className="text-sm font-semibold text-ink tabular-nums">
              {row.pct}%
            </span>
          </div>
          {/* Bar track */}
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-ink transition-all duration-500"
              style={{ width: `${(row.pct / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
