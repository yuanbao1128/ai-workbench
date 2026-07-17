'use client'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 flex flex-col items-center gap-3">
      <span className="text-4xl">{icon}</span>
      <p className="text-gray-500 font-medium">{title}</p>
      {description && <p className="text-sm text-gray-400">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
