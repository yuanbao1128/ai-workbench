export default function Loading() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">日程表</h1>
      <div className="flex gap-1 mb-4">
        <div className="w-16 h-8 bg-gray-100 rounded-lg animate-pulse" />
        <div className="w-16 h-8 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}