import { TodayOverview } from '@/components/dashboard/TodayOverview'
import { QuickChat } from '@/components/dashboard/QuickChat'
import { ThresholdReminder } from '@/components/knowledge/ThresholdReminder'

export default function Home() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">今日概览</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
            })}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <ThresholdReminder />
        <TodayOverview />
        <QuickChat />
      </div>
    </div>
  )
}