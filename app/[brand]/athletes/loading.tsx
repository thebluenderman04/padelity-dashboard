function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-border rounded-xl ${className ?? ""}`} />;
}

export default function AthletesLoading() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-4 w-44 mt-2" />
      </div>

      <div
        className="bg-surface rounded-2xl p-6"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 pb-3 border-b border-border mb-2">
          {["Athlete", "Rank", "Followers", "Eng. Rate", "Avg. Reach"].map((h) => (
            <Skeleton key={h} className="h-3 w-16 rounded" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 py-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
              <div>
                <Skeleton className="h-3 w-24 rounded mb-1" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-16 rounded self-center" />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <Skeleton className="h-2.5 w-20 mx-auto mb-3 rounded" />
            <Skeleton className="h-7 w-16 mx-auto rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
