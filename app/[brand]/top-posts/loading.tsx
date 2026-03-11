function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-border rounded-xl ${className ?? ""}`} />;
}

export default function TopPostsLoading() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
              <Skeleton className="h-3 w-full rounded mb-1" />
              <Skeleton className="h-3 w-3/4 rounded mb-3" />
              <div className="flex gap-3">
                <Skeleton className="h-3 w-10 rounded" />
                <Skeleton className="h-3 w-10 rounded" />
                <Skeleton className="h-3 w-12 rounded ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
