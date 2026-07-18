/**
 * Voice / Text English-to-Chinese terminology dictionary.
 * Used for normalizing voice transcription and casual text that mixes English terms,
 * so the LLM intent recognizer receives a Chinese-friendly prompt.
 */

export interface TermMapping {
  /** Triggers (case-insensitive, word-boundary matched). */
  patterns: string[]
  /** Chinese replacement that the LLM can recognize. */
  replacement: string
  /** Hint for which intent this typically maps to. */
  intent?:
    | 'ADD_TERM'
    | 'ADD_DESIGN'
    | 'ADD_INSPIRATION'
    | 'ADD_MEETING'
    | 'ADD_QUESTION'
    | 'ADD_TODO'
    | 'ADD_DELEGATION'
}

/**
 * Order matters: longer / more specific patterns first so they replace
 * before any shorter alias gets a chance to truncate them.
 */
export const TERM_DICT: TermMapping[] = [
  // ─── Todo / Task ─────────────────────────────────────────
  { patterns: ['to-do', 'to do'], replacement: '待办', intent: 'ADD_TODO' },
  { patterns: ['todo'], replacement: '待办', intent: 'ADD_TODO' },
  { patterns: ['task', 'tasks'], replacement: '任务', intent: 'ADD_TODO' },
  { patterns: ['reminder', 'remind'], replacement: '提醒', intent: 'ADD_TODO' },

  // ─── Meeting ────────────────────────────────────────────
  { patterns: ['meeting'], replacement: '会议', intent: 'ADD_MEETING' },
  { patterns: ['sync up', 'sync'], replacement: '同步会', intent: 'ADD_MEETING' },
  { patterns: ['standup', 'stand-up'], replacement: '站会' },
  { patterns: ['huddle'], replacement: '快速会议' },

  // ─── Delegation ─────────────────────────────────────────
  { patterns: ['delegate to', 'delegated to'], replacement: '转委托给' },
  { patterns: ['assign to', 'assigned to'], replacement: '分派给' },
  { patterns: ['hand off', 'hand-off', 'handoff'], replacement: '交接给' },

  // ─── Capture / Note ─────────────────────────────────────
  { patterns: ['log this', 'log it', 'log'], replacement: '记一下' },
  { patterns: ['jot down', 'jot it down', 'jot'], replacement: '记一下' },
  { patterns: ['note down', 'note this', 'note'], replacement: '记一下' },
  { patterns: ['keep track of'], replacement: '记录' },
  { patterns: ['save this'], replacement: '保存一下' },

  // ─── Inspiration / Question ─────────────────────────────
  { patterns: ['what if', 'how about'], replacement: '想法' },
  { patterns: ['i wonder why', 'wonder why'], replacement: '为什么' },
  { patterns: ['not sure why'], replacement: '不清楚' },

  // ─── Relative time ──────────────────────────────────────
  { patterns: ['tomorrow'], replacement: '明天' },
  { patterns: ['today'], replacement: '今天' },
  { patterns: ['tonight'], replacement: '今晚' },
  { patterns: ['yesterday'], replacement: '昨天' },
  { patterns: ['eod'], replacement: '今天下班前' },
  { patterns: ['asap'], replacement: '尽快' },
  { patterns: ['next week'], replacement: '下周' },
  { patterns: ['next monday'], replacement: '下周一' },
  { patterns: ['this week'], replacement: '这周' },
  { patterns: ['this friday'], replacement: '本周五' },
  { patterns: ['later'], replacement: '稍后' },
]

export interface NormalizeResult {
  text: string
  replacements: { from: string; to: string }[]
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Normalize voice / mixed text by replacing English terms with their Chinese counterparts.
 * Uses a single regex pass per pattern (case-insensitive, word-boundary-safe).
 * Returns the normalized text and the list of replacements made (for debugging).
 */
export function normalizeVoiceText(input: string): NormalizeResult {
  let text = input
  const replacements: { from: string; to: string }[] = []

  for (const mapping of TERM_DICT) {
    for (const pattern of mapping.patterns) {
      const safe = escapeRegex(pattern)
      // Word boundary: must not be preceded or followed by ASCII word char.
      const regex = new RegExp(`(?<![A-Za-z0-9])${safe}(?![A-Za-z0-9])`, 'gi')
      const matches = Array.from(text.matchAll(regex))
      for (const m of matches) {
        replacements.push({ from: m[0], to: mapping.replacement })
      }
      text = text.replace(regex, mapping.replacement)
    }
  }

  return { text: text.trim().replace(/\s+/g, ' '), replacements }
}
