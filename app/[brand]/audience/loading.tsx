function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-border rounded-xl ${className ?? ""}`} />;
}

export default function AudienceLoading() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-surface rounded-2xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <Skeleton className="h-4 w-36 mb-2 rounded" />
            <Skeleton className="h-3 w-48 mb-6 rounded" />
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-12 rounded" />
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-8 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-2xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <Skeleton className="h-4 w-32 mb-2 rounded" />
        <Skeleton className="h-3 w-48 mb-6 rounded" />
        <div className="space-y-4 max-w-lg">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1.5">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
              <Skeleton className="h-1.5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
