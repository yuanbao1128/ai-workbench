import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${
        hover ? 'hover:shadow-md hover:border-gray-300 cursor-pointer transition-shadow' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}