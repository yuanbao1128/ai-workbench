'use client'

type SkeletonVariant = 'grid-3x3' | 'card' | 'list'

interface SkeletonProps {
  variant?: SkeletonVariant
  count?: number
}

export function Skeleton({ variant = 'card', count = 3 }: SkeletonProps) {
  if (variant === 'grid-3x3') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  // card variant
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}
