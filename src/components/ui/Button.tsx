import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'icon'
  children: ReactNode
}

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-700',
  ghost: 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
  icon: 'w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-100',
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}