interface DotProps {
  color: 'red' | 'green' | 'amber' | 'blue' | 'gray'
  className?: string
}

const colorClasses = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  gray: 'bg-gray-400',
}

export function Dot({ color, className = '' }: DotProps) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colorClasses[color]} ${className}`} />
  )
}