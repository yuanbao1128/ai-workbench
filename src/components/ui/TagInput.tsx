'use client'

import { useState } from 'react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = '输入标签，回车添加' }: TagInputProps) {
  const [input, setInput] = useState('')

  const addTag = (value: string) => {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-gray-400 hover:text-gray-600 ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTag(input)
          }
        }}
      />
    </div>
  )
}
