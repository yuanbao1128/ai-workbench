'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// Speech Recognition types
interface SpeechRecognitionEvent {
  results: Array<Array<{ transcript: string; confidence: number }>>
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

// Extend Window interface for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}

interface VoiceInputProps {
  onResult: (text: string) => void
  /** Show as prominent mobile button (48px, blue) */
  prominent?: boolean
}

const TIMEOUT_MS = 60000 // 60s max recording
const CANCEL_THRESHOLD = 40 // px finger movement to cancel

export function VoiceInput({ onResult, prominent }: VoiceInputProps) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startYRef = useRef<number>(0)
  const isTouchRef = useRef(false)

  const isSupported = useCallback(() => {
    if (typeof window === 'undefined') return false
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }, [])

  useEffect(() => {
    setSupported(isSupported())
  }, [isSupported])

  const clearRecognition = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { /* ignore */ }
      recognitionRef.current = null
    }
  }, [])

  const startRecognition = useCallback(() => {
    if (!isSupported()) {
      setSupported(false)
      return
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) {
      setSupported(false)
      return
    }
    const recognition = new SpeechRecognitionClass() as SpeechRecognition
    recognition.lang = 'zh-CN'
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0]?.transcript || ''
      if (text.trim()) {
        onResult(text)
      }
      setListening(false)
      clearRecognition()
    }

    recognition.onerror = () => {
      setListening(false)
      clearRecognition()
    }

    recognition.onend = () => {
      setListening(false)
      clearRecognition()
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)

    // 8.5: 60s timeout auto-send
    timeoutRef.current = setTimeout(() => {
      recognition.stop()
      setListening(false)
    }, TIMEOUT_MS)
  }, [isSupported, onResult, clearRecognition])

  // 8.6: Browser not supported — show disabled button
  if (!supported) return null

  // === Long-press handler for mobile ===
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    isTouchRef.current = e.pointerType === 'touch'
    startYRef.current = e.clientY
    setCancelling(false)
    startRecognition()
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!listening || !isTouchRef.current) return
    // 8.4: Slide out of button → cancel
    const deltaY = Math.abs(e.clientY - startYRef.current)
    setCancelling(deltaY > CANCEL_THRESHOLD)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault()
    // 8.4: If cancelled (slid out), abort
    if (cancelling) {
      clearRecognition()
      setListening(false)
      setCancelling(false)
      return
    }
    // 8.3: Release → stop and send
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch { /* ignore */ }
    }
  }

  // === Click handler for desktop ===
  const handleClick = () => {
    if (listening) {
      clearRecognition()
      setListening(false)
    } else {
      startRecognition()
    }
  }

  // 8.1: Prominent mobile button (48x48 blue)
  if (prominent) {
    return (
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          listening
            ? cancelling
              ? 'bg-gray-400 scale-90'
              : 'bg-red-500 scale-110 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        title={listening ? '松开发送' : '按住说话'}
      >
        <span className="text-white text-xl">🎤</span>
      </button>
    )
  }

  // Desktop: compact button
  return (
    <button
      onClick={handleClick}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
        listening
          ? 'bg-red-100 text-red-500 animate-pulse'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      }`}
      title={listening ? '停止录音' : '语音输入'}
    >
      🎤
    </button>
  )
}
