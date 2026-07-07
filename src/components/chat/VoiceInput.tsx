'use client'

import { useState, useRef } from 'react'

// Speech Recognition type declarations
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
  length: number
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}

interface VoiceInputProps {
  onResult: (text: string) => void
}

export function VoiceInput({ onResult }: VoiceInputProps) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const startListening = () => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript
      onResult(text)
      setListening(false)
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  if (!supported) return null

  return (
    <button
      onClick={listening ? stopListening : startListening}
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