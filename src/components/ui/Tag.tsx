import { ReactNode } from 'react'

interface TagProps {
  children: ReactNode
  className?: string
}

export function Tag({ children, className = '' }: TagProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-600 ${className}`}>
      {children}
    </span>
  )
}