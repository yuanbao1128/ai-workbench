export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">日报 & 周报</h1>
        <div className="flex gap-2">
          <div className="w-20 h-9 bg-gray-100 rounded-lg animate-pulse" />
          <div className="w-20 h-9 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}