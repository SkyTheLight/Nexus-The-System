export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-lg p-5 animate-pulse">
      <div className="h-4 bg-accent rounded w-3/4 mb-3" />
      <div className="h-3 bg-accent rounded w-1/2 mb-2" />
      <div className="h-3 bg-accent rounded w-1/4" />
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-accent rounded-full" />
            <div className="h-4 bg-accent rounded flex-1" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-5 animate-pulse">
          <div className="h-4 bg-accent rounded w-3/4 mb-3" />
          <div className="h-3 bg-accent rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}
