function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-border rounded-xl ${className ?? ""}`} />
  );
}

export default function OverviewLoading() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-2xl p-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <Skeleton className="h-3 w-24 mb-4 rounded" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div
          className="xl:col-span-2 bg-surface rounded-2xl p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <Skeleton className="h-4 w-40 mb-2 rounded" />
          <Skeleton className="h-3 w-52 mb-6 rounded" />
          <Skeleton className="h-[260px] rounded-xl" />
        </div>
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <Skeleton className="h-4 w-28 mb-2 rounded" />
          <Skeleton className="h-3 w-20 mb-6 rounded" />
          <Skeleton className="h-44 w-44 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  );
}
