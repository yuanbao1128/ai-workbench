/**
 * Chat message persistence layer (localStorage).
 * Single-session storage: 100-message FIFO ring, no cross-device sync.
 */

export interface ResultCard {
  type: string
  title: string
}

export interface ResultEntry {
  type: string
  success: boolean
  message: string
  card?: ResultCard
}

export interface PersistedMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  results?: ResultEntry[]
  timestamp: number
}

const STORAGE_KEY = 'ai-workbench:chat:messages:v1'
const MAX_MESSAGES = 100

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function loadMessages(): PersistedMessage[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PersistedMessage[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveMessages(messages: PersistedMessage[]): void {
  if (!isBrowser()) return
  try {
    // FIFO truncation if exceeding cap
    const trimmed = messages.length > MAX_MESSAGES
      ? messages.slice(messages.length - MAX_MESSAGES)
      : messages
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // silent: storage may be full or disabled (e.g. private mode)
  }
}

export function clearMessages(): void {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // silent
  }
}

export function generateMessageId(): string {
  // Simple unique id — adequate for client-only deduplication
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
