'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  exiting: boolean
}

let toastId = 0
let addToastFn: ((message: string, type: ToastType) => void) | null = null

export function showToast(message: string, type: ToastType = 'info') {
  addToastFn?.(message, type)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type, exiting: false }])

    // Start exit animation at 2.7s
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    }, 2700)

    // Remove at 3s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    addToastFn = addToast
    return () => { addToastFn = null }
  }, [addToast])

  const iconMap: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }

  const bgMap: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-xl border shadow-lg text-sm flex items-center gap-2 pointer-events-auto max-w-sm ${
            bgMap[toast.type]
          } ${toast.exiting ? 'animate-toast-out' : 'animate-toast-in'}`}
        >
          <span>{iconMap[toast.type]}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
