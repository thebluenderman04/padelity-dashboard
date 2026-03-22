// Server-renderable — no client state needed

const BENCHMARKS = [
  { label: "SEA Sports Creator avg.", value: 0.8 },
  { label: "MY Lifestyle Creator avg.", value: 1.2 },
];

interface Props {
  engagementRate: number; // percent
}

export default function BenchmarkCard({ engagementRate }: Props) {
  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-ink">Benchmark Comparison</h2>
        <p className="text-xs text-ink-muted mt-0.5">Engagement rate vs. industry averages</p>
      </div>

      {/* Athlete's own rate */}
      <div className="mb-5 p-3 bg-canvas rounded-xl">
        <p className="text-[10px] text-ink-muted uppercase tracking-[0.1em] mb-1">This Athlete</p>
        <p className="text-2xl font-display font-semibold text-ink">{engagementRate.toFixed(2)}%</p>
      </div>

      {/* Benchmark rows */}
      <div className="space-y-3">
        {BENCHMARKS.map(({ label, value }) => {
          const above = engagementRate >= value;
          const diff = Math.abs(engagementRate - value).toFixed(2);
          return (
            <div key={label} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-ink truncate">{label}</p>
                <p className="text-[10px] text-ink-muted">{value.toFixed(1)}%</p>
              </div>
              <span
                className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                  above
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {above ? "+" : "-"}{diff}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
