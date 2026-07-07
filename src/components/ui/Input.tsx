import { ReactNode, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  children?: ReactNode
}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors ${className}`}
      {...props}
    />
  )
}