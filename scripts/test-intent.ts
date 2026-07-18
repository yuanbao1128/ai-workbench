/**
 * Smoke test for AI intent components:
 *  - Voice term dictionary normalization
 *  - Relative date parser
 *  - Keyword fallback intent matching
 *
 * Run with: node --import tsx scripts/test-intent.ts
 */

import { normalizeVoiceText, TERM_DICT } from '../src/lib/voice/term-dict.js'
import {
  parseRelativeDate,
} from '../src/lib/chat/relative-date.js'
import { keywordIntentMatch, preprocessUserInput } from '../src/lib/ai/intent.js'

let pass = 0
let fail = 0

function eq(actual: unknown, expected: unknown, label: string) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) {
    pass++
    console.log(`✓ ${label}`)
  } else {
    fail++
    console.log(`✗ ${label}`)
    console.log(`    expected: ${JSON.stringify(expected)}`)
    console.log(`    actual:   ${JSON.stringify(actual)}`)
  }
}

function ok(condition: boolean, label: string) {
  if (condition) {
    pass++
    console.log(`✓ ${label}`)
  } else {
    fail++
    console.log(`✗ ${label}`)
  }
}

// ─────────────────────────────────────────────────────────────
// Voice dictionary tests
// ─────────────────────────────────────────────────────────────
console.log('\n=== Voice Term Dictionary ===')
eq(
  normalizeVoiceText('log K8s').text,
  '记一下 K8s',
  'IT-VOICE-001: log K8s → 记一下 K8s'
)
eq(
  normalizeVoiceText('add a todo for tomorrow').text,
  'add a 待办 for 明天',
  'IT-VOICE-002: add a todo → 待办 + tomorrow → 明天'
)
eq(
  normalizeVoiceText('jot down Vector DB').text,
  '记一下 Vector DB',
  'IT-VOICE-003: jot down Vector DB → 记一下 Vector DB'
)
eq(
  normalizeVoiceText('meeting tomorrow 10am').text,
  '会议 明天 10am',
  'IT-VOICE-004: meeting tomorrow → 会议 明天'
)
eq(
  normalizeVoiceText('delegate to 张工').text,
  '转委托给 张工',
  'IT-VOICE-005: delegate to 张工 → 转委托给'
)
eq(
  normalizeVoiceText('remind me at eod').text,
  '提醒 me at 今天下班前',
  'IT-VOICE-006: remind/eod → 提醒/今天下班前'
)
eq(
  normalizeVoiceText('asap sync up').text,
  '尽快 同步会',
  'IT-VOICE-007: asap sync up → 尽快 同步会'
)

// IDempotency: dictionary should not double-apply.
eq(
  normalizeVoiceText('todo list').text,
  '待办 list',
  'IT-VOICE-008: duplicate-skip on next cycle'
)

// Word boundary
eq(
  normalizeVoiceText('stoolroom').text,
  'stoolroom',
  'IT-VOICE-009: word-boundary safe (stoolroom untouched)'
)

// ─────────────────────────────────────────────────────────────
// Relative date parser tests
// ─────────────────────────────────────────────────────────────
console.log('\n=== Relative Date Parser ===')
// Use a fixed "now" anchored to local-time noon so tests don't depend on TZ
const FIXED_NOW = new Date(2026, 6, 18, 12, 0, 0) // 2026-07-18 12:00 local

// Use a helper that injects "now" and compares against local-time fields
const parseIso = (text: string) => {
  const result = parseRelativeDate(text, FIXED_NOW)
  if (!result.iso) return null
  // Convert to local format for assertion (YYYY-MM-DDTHH:mm:ss)
  const d = new Date(result.iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

eq(parseIso('今天下午 3 点'), '2026-07-18T15:00:00', 'IT-RD-001: 今天下午 3 点')
eq(parseIso('明天上午 10 点'), '2026-07-19T10:00:00', 'IT-RD-002: 明天上午 10 点')
eq(parseIso('后天'), '2026-07-20T09:00:00', 'IT-RD-003: 后天 (default 9:00)')
eq(parseIso('明天下午 3 点'), '2026-07-19T15:00:00', 'IT-RD-004: 明天下午 3 点')
eq(parseIso('今晚 8 点'), '2026-07-18T20:00:00', 'IT-RD-005: 今晚 8 点')
eq(parseIso('下班前'), '2026-07-18T18:00:00', 'IT-RD-006: eod/下班前')
eq(
  parseIso('asap'),
  '2026-07-18T12:00:00',
  'IT-RD-007: asap → now'
)
eq(parseIso('eod'), '2026-07-18T18:00:00', 'IT-RD-008: eod → 18:00')
eq(
  parseIso('10 分钟后'),
  '2026-07-18T12:10:00',
  'IT-RD-009: 10 分钟后'
)
eq(
  parseIso('月底'),
  '2026-07-31T23:59:00',
  'IT-RD-010: 月底'
)
ok(parseRelativeDate('我不知道', FIXED_NOW).iso === null, 'IT-RD-011: no-match returns null')

// ISO absolute
eq(parseIso('2026-07-25 09:00'), '2026-07-25T09:00:00', 'IT-RD-012: ISO absolute')

// M+D format (month default is current year, July; "7 月 25 日" maps to 7/25)
eq(parseIso('7 月 25 日 10 点'), '2026-07-25T10:00:00', 'IT-RD-013: M月D日 format')

// ─────────────────────────────────────────────────────────────
// Keyword matching tests (LLM-fallback path)
// ─────────────────────────────────────────────────────────────
console.log('\n=== Keyword Intent Matching ===')

eq(
  keywordIntentMatch('记一下 K8s')[0].type,
  'ADD_TERM',
  'IT-KW-001: 记一下 K8s → ADD_TERM'
)
eq(
  keywordIntentMatch('今天要完成需求文档')[0].type,
  'ADD_TODO',
  'IT-KW-002: 今天要完成 xxx → ADD_TODO'
)
eq(
  keywordIntentMatch('转给王工排查')[0].type,
  'ADD_DELEGATION',
  'IT-KW-003: 转给王工排查 → ADD_DELEGATION'
)
eq(
  keywordIntentMatch('帮我写周报')[0].type,
  'GENERATE_REPORT',
  'IT-KW-004: 帮我写周报 → GENERATE_REPORT (周报)'
)
eq(
  keywordIntentMatch('今天有什么重点')[0].type,
  'QUERY',
  'IT-KW-005: 今天有什么重点 → QUERY'
)
eq(
  keywordIntentMatch('add a task: review PR')[0].type,
  'ADD_TODO',
  'IT-KW-006: add a task → ADD_TODO (English)'
)
eq(
  keywordIntentMatch('meeting note 站会要点')[0].type,
  'ADD_MEETING',
  'IT-KW-007: meeting note → ADD_MEETING'
)
eq(
  keywordIntentMatch('灵感：把设置页改成向导式')[0].type,
  'ADD_INSPIRATION',
  'IT-KW-008: 灵感 → ADD_INSPIRATION'
)
eq(
  keywordIntentMatch('not sure why 首页加载慢')[0].type,
  'ADD_QUESTION',
  'IT-KW-009: not sure why → ADD_QUESTION'
)

// ─────────────────────────────────────────────────────────────
// Preprocess integration test
// ─────────────────────────────────────────────────────────────
console.log('\n=== Preprocess Integration ===')
{
  const raw = 'log K8s 不太懂'
  const pre = preprocessUserInput(raw)
  ok(pre.cleaned.includes('记一下'), 'IT-PRE-001: preprocess injects "记一下"')
  ok(pre.replacements.length > 0, 'IT-PRE-002: replacement list populated')
}

// ─────────────────────────────────────────────────────────────
console.log(`\n=== TOTAL: ${pass} pass / ${fail} fail ===`)
process.exit(fail === 0 ? 0 : 1)
