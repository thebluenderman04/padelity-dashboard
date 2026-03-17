export default function ProfileLoading() {
  return (
    <div className="animate-pulse">
      {/* Back link */}
      <div className="mb-6 h-5 w-32 bg-border rounded-lg" />

      {/* Header card */}
      <div className="bg-surface rounded-2xl p-6 mb-4 flex items-center gap-6"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="w-16 h-16 rounded-2xl bg-border flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-48 bg-border rounded-lg" />
          <div className="h-4 w-32 bg-border rounded-lg" />
          <div className="h-4 w-56 bg-border rounded-lg mt-1" />
        </div>
      </div>

      {/* Snapshot strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl p-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="h-3 w-16 bg-border rounded mb-3" />
            <div className="h-6 w-20 bg-border rounded" />
          </div>
        ))}
      </div>

      {/* Profile panel placeholder */}
      <div
        className="bg-surface rounded-2xl p-8 flex flex-col items-center"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="h-12 w-12 bg-border rounded-2xl mb-4" />
        <div className="h-5 w-48 bg-border rounded mb-2" />
        <div className="h-4 w-72 bg-border rounded mb-6" />
        <div className="h-10 w-36 bg-border rounded-xl" />
      </div>
    </div>
  );
}
