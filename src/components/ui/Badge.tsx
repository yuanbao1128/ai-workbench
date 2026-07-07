import { ReactNode } from 'react'

type BadgeVariant = 'red' | 'green' | 'blue' | 'amber' | 'gray'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  red: 'bg-red-50 text-red-600',
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  gray: 'bg-gray-100 text-gray-500',
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}