export default function Loading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-9 w-44 bg-ink/6 rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-32 bg-ink/4 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-surface rounded-2xl p-6 animate-pulse"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="h-4 w-48 bg-ink/6 rounded mb-2" />
            <div className="h-3 w-64 bg-ink/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
