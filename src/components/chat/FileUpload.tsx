'use client'

import { useRef, useState } from 'react'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

const ACCEPTED_TYPES = '.pdf,.docx,.doc,.txt,.md,.png,.jpg'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TOTAL_SIZE = 30 * 1024 * 1024 // 30MB

export function FileUpload({ onFilesSelected, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const handleClick = () => {
    inputRef.current?.click()
  }

  const validateAndSelect = (fileList: FileList) => {
    setError('')
    const files = Array.from(fileList)

    // Check individual sizes
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError('⚠️ 文件大小超过限制（10MB）')
        return
      }
    }

    // Check total size
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    if (totalSize > MAX_TOTAL_SIZE) {
      setError('⚠️ 文件总大小超过限制（30MB）')
      return
    }

    onFilesSelected(files)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES}
        onChange={(e) => e.target.files && validateAndSelect(e.target.files)}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={disabled}
        className="w-7 h-7 flex items-center justify-center border border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50"
        title="上传文件"
      >
        📎
      </button>
      {error && (
        <p className="absolute bottom-full mb-1 left-0 whitespace-nowrap text-xs text-red-500 bg-white rounded px-2 py-1 shadow">
          {error}
        </p>
      )}
    </div>
  )
}
