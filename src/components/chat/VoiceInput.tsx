'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { showToast } from '@/components/ui/Toast'

// Speech Recognition types
interface SpeechRecognitionEvent {
  results: Array<Array<{ transcript: string; confidence: number }>>
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives?: number
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onnomatch?: (() => void) | null
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
  /** Show as prominent mobile button (full-width, distinct from text input) */
  prominent?: boolean
}

const TIMEOUT_MS = 60000 // 60s max recording
const CANCEL_THRESHOLD = 40 // px finger movement to cancel

const ERROR_HINTS: Record<string, string> = {
  'no-speech': '未检测到声音，请检查麦克风后重试',
  'audio-capture': '无法访问麦克风，请确认浏览器权限已开启',
  'not-allowed': '麦克风权限被拒绝，请在浏览器设置中开启',
  'not-allowed-error': '麦克风权限被拒绝',
  network: '网络异常，语音识别需要联网，请稍后重试',
  aborted: '已取消录音',
  'language-not-supported': '当前浏览器不支持中文语音识别',
  service: '语音服务暂时不可用，请稍后重试',
}

export function VoiceInput({ onResult, prominent }: VoiceInputProps) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  // Track whether we received any result before onend fires
  const resultReceivedRef = useRef(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startYRef = useRef<number>(0)
  const isTouchRef = useRef(false)
  const toast = showToast

  const isSupported = useCallback(() => {
    if (typeof window === 'undefined') return false
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }, [])

  useEffect(() => {
    const ok = isSupported()
    setSupported(ok)
    if (!ok) {
      // iOS in-app browser often lacks the API → fallback to text input
      setTimeout(
        () =>
          toast('当前浏览器不支持语音输入，请直接打字', 'warning'),
        800
      )
    }
  }, [isSupported, toast])

  const clearRecognition = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }
  }, [])

  const startRecognition = useCallback(() => {
    resultReceivedRef.current = false
    if (!isSupported()) {
      setSupported(false)
      return
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) {
      setSupported(false)
      toast('浏览器不支持语音识别，已自动切换到打字模式', 'warning')
      return
    }

    let recognition: SpeechRecognition
    try {
      recognition = new SpeechRecognitionClass() as SpeechRecognition
    } catch (e) {
      toast('语音模块初始化失败', 'error')
      return
    }

    // 中文为主，浏览器会自动处理轻微英文
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.continuous = false
    if ('maxAlternatives' in recognition) {
      recognition.maxAlternatives = 1
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      resultReceivedRef.current = true
      const text = event.results[0]?.[0]?.transcript || ''
      if (text.trim()) {
        onResult(text)
        toast(
          `已识别：${text.slice(0, 30)}${text.length > 30 ? '...' : ''}`,
          'success'
        )
      }
      setListening(false)
      clearRecognition()
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const hint = ERROR_HINTS[event.error] || `识别失败（${event.error}）`
      // 用户主动中止不报错
      if (event.error === 'aborted') return
      toast(hint, 'error')
      setListening(false)
      setCancelling(false)
      clearRecognition()
    }

    recognition.onnomatch = () => {
      toast('未匹配到内容，请再说一次', 'warning')
    }

    recognition.onend = () => {
      // If end fires without result and no error, surface a hint
      if (!resultReceivedRef.current) {
        toast('未听到声音，请检查麦克风权限或靠近一点', 'warning')
      }
      setListening(false)
      setCancelling(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      recognitionRef.current = null
    }

    try {
      recognitionRef.current = recognition
      recognition.start()
      setListening(true)
    } catch (e) {
      toast('启动语音识别失败，请稍后重试', 'error')
      setListening(false)
      return
    }

    // 60s timeout auto-send
    timeoutRef.current = setTimeout(() => {
      try {
        recognition.stop()
      } catch {
        /* ignore */
      }
      setListening(false)
    }, TIMEOUT_MS)
  }, [isSupported, onResult, clearRecognition, toast])

  // Browser not supported — render nothing (don't break UI)
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
    const deltaY = Math.abs(e.clientY - startYRef.current)
    setCancelling(deltaY > CANCEL_THRESHOLD)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault()
    if (cancelling) {
      clearRecognition()
      setListening(false)
      setCancelling(false)
      toast('已取消录音', 'info')
      return
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        /* ignore */
      }
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

  // Prominent mobile button — full-width "按住 说话" style
  if (prominent) {
    return (
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
        onTouchEnd={(e) => e.preventDefault()}
        className={`w-full rounded-xl flex items-center justify-center gap-3 py-4 px-6 transition-all select-none touch-none ${
          listening
            ? cancelling
              ? 'bg-gray-400 scale-95'
              : 'bg-red-500 scale-[1.02] animate-pulse-recording'
            : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-200'
        }`}
        title={listening ? '松开发送，上滑取消' : '按住说话'}
      >
        <span
          className={`text-2xl ${listening && !cancelling ? 'text-white' : 'text-gray-500'}`}
        >
          🎤
        </span>
        <span
          className={`text-base font-medium ${
            listening ? 'text-white' : 'text-gray-500'
          }`}
        >
          {listening ? (cancelling ? '松开取消' : '松开 发送') : '按住 说话'}
        </span>
      </button>
    )
  }

  // Desktop: compact toggle button
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
