import Link from 'next/link'

export function ThresholdReminder({ count = 0 }: { count?: number }) {
  if (count < 5) return null

  return (
    <Link
      href="/knowledge?type=TERM&status=UNKNOWN"
      className="block bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 hover:bg-amber-100 transition-colors"
    >
      📚 待了解名词已达 {count} 个，有空时集中查阅吧
    </Link>
  )
}