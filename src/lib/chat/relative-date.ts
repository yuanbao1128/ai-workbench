/**
 * Relative-date parser for Chinese and English expressions.
 *
 * Supports:
 *  - "今天" / "tonight" / "today"
 *  - "明天" / "tomorrow" / "明早" / "明晚"
 *  - "后天" / "大后天"
 *  - "下周一/二/三..." / "本周X" / "next monday" / "this friday"
 *  - "X月Y日" / "X月Y号" / "10/25"
 *  - "现在" / "10分钟后" / "asap"
 *  - "今天下班前" / "eod"
 *  - "月底" / "下个工作日"
 *  - default: null (LLM-fallback)
 */

const ZH_NUM: Record<string, number> = {
  一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
  〇: 0, 零: 0,
}

const ZH_WEEKDAY: Record<string, number> = {
  一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 日: 0, 天: 0, 末: 6,
}

/** Parse a Chinese number (one or two digits) into a JS Number. */
function zhNum(s: string): number {
  if (!s) return NaN
  if (/^\d+$/.test(s)) return Number(s)
  // "十X" -> 10 + X   "X十" -> X*10   "X十Y" -> X*10 + Y
  if (s === '十') return 10
  if (s.startsWith('十')) return 10 + (ZH_NUM[s[1]] ?? 0)
  if (s.endsWith('十')) return (ZH_NUM[s[0]] ?? 0) * 10
  const idx = s.indexOf('十')
  if (idx > 0) {
    const left = ZH_NUM[s[idx - 1]] ?? 0
    const right = ZH_NUM[s[idx + 1]] ?? 0
    return left * 10 + right
  }
  let n = 0
  for (const ch of s) {
    if (ZH_NUM[ch] == null) return NaN
    n = n * 10 + ZH_NUM[ch]
  }
  return n
}

const TIME_HHMM = /(\d{1,2})\s*[:：]\s*(\d{1,2})/
const TIME_AMPM = /(上午|早上|早晨|凌晨|am|AM)\s*(\d{1,2})\s*[:：]?\s*(\d{1,2})?\s*[点时:：]?\s*(\d{1,2})?\s*分?/
const TIME_PM = /(下午|晚上|傍晚|pm|PM)\s*(\d{1,2})\s*[:：]?\s*(\d{1,2})?\s*[点时:：]?\s*(\d{1,2})?\s*分?/

function parseTime(date: Date, text: string, defaultHour = 9): Date {
  let hours = defaultHour
  let minutes = 0

  // Explicit HH:MM first
  const m1 = text.match(TIME_HHMM)
  if (m1) {
    hours = Number(m1[1])
    minutes = Number(m1[2])
  } else {
    // 今晚 implies evening → default to 20:00 if no time given
    if (/今晚/.test(text) && !/点/.test(text.split('今晚')[1])) {
      date.setHours(20, 0, 0, 0)
      return date
    }
    // Chinese AM/PM form
    const m2 = text.match(TIME_PM)
    const m3 = text.match(TIME_AMPM)
    if (m2) {
      let h = Number(m2[2])
      const min = m2[3] ? Number(m2[3]) : m2[4] ? Number(m2[4]) : 0
      if (h < 12) h += 12 // 下午 3 点 = 15
      if (h === 24) h = 12
      hours = h
      minutes = min
    } else if (m3) {
      let h = Number(m3[2])
      const min = m3[3] ? Number(m3[3]) : m3[4] ? Number(m3[4]) : 0
      if (h === 12) h = 0
      hours = h
      minutes = min
    } else {
      // "3点" / "3点半" / "三点" / "10 点" (allow space)
      const m4 = text.match(/([\d]{1,2}|[一二三四五六七八九十百千万]+)\s*点(半|([\d]{1,2}|[一二三四五六七八九十]+)分)?/)
      if (m4) {
        hours = zhNum(m4[1])
        if (hours > 24 || isNaN(hours)) return date
        if (m4[2] === '半') minutes = 30
        else if (m4[3]) minutes = zhNum(m4[3])
        // 今晚/傍晚/晚上 + 数字 ≤ 12 → PM (12以下按PM处理)
        if (/今晚|傍晚/.test(text) && hours < 12) {
          hours += 12
        }
      }
    }
  }

  if (!isNaN(hours) && hours < 24 && minutes < 60) {
    date.setHours(hours, minutes, 0, 0)
  }
  return date
}

/** Move a Date forward by N days (does not mutate). */
function addDays(d: Date, days: number): Date {
  const c = new Date(d)
  c.setDate(c.getDate() + days)
  return c
}

/** Return ISO 8601 string. */
function iso(d: Date): string {
  return d.toISOString()
}

/** Find the next occurrence of the given weekday (0=Sunday, 1=Monday...). */
function nextWeekday(d: Date, target: number, weeksAhead = 0): Date {
  const cur = d.getDay()
  let delta = (target - cur + 7) % 7
  if (delta === 0) delta = 7 * Math.max(1, weeksAhead) // if same day but require future
  if (weeksAhead > 0) delta += weeksAhead * 7
  return addDays(d, delta === 0 ? 7 : delta)
}

export interface RelativeDateResult {
  iso: string | null
  matched: string | null
  reason: 'parsed' | 'no-match' | 'recurrence' | 'ambiguous'
}

/**
 * Parse relative dates from natural-language Chinese / English strings.
 * Mutates nothing; passes `now` for deterministic tests.
 */
export function parseRelativeDate(text: string, now: Date = new Date()): RelativeDateResult {
  const norm = text.toLowerCase().trim()

  // ─── 分钟级 ─────────────────────────────────────────────
  const mins = norm.match(/(\d+)\s*分钟[后以]?/)
  if (mins && /(之后|后|after)/.test(norm)) {
    const d = new Date(now.getTime() + Number(mins[1]) * 60_000)
    return { iso: iso(d), matched: mins[0], reason: 'parsed' }
  }

  // ─── 节日/节气（最小集） ────────────────────────────────
  // skipped in v1, LLM 兜底

  // ─── ISO 或纯日期 ─────────────────────────────────────
  const isoMatch = norm.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2})[:：](\d{1,2}))?/)
  if (isoMatch) {
    const [, y, m, d, hh, mm] = isoMatch
    const dt = new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      hh ? Number(hh) : 9,
      mm ? Number(mm) : 0,
      0
    )
    return { iso: iso(dt), matched: isoMatch[0], reason: 'parsed' }
  }

  // Match month + day; capture date and time separately by NOT consuming
  // leading digits as part of the date pattern.
  const mdMatch = norm.match(/(\d{1,2})\s*[月.]\s*(\d{1,2})\s*[日号.]?/)
  if (mdMatch) {
    const month = Number(mdMatch[1]) - 1
    const day = Number(mdMatch[2])
    const year = now.getFullYear()
    const dt = new Date(year, month, day, 9, 0, 0)
    parseTime(dt, norm, 9)
    // 过去日期自动顺延一年
    if (dt < now) dt.setFullYear(year + 1)
    return { iso: iso(dt), matched: mdMatch[0], reason: 'parsed' }
  }

  // ─── 相对词：今晚/今早/明早/明晚/今晚8点 ─────────────
  let result: Date | null = null

  // ── "今天/今晚/今早"
  if (/今天|今晚|今早|today|tonight/.test(norm)) {
    result = new Date(now)
  }
  // ── "明天/明早/明晚"
  else if (/明天|明早|明晚|tomorrow/.test(norm)) {
    result = addDays(now, 1)
  }
  // ── "后天"
  else if (/后天/.test(norm)) {
    result = addDays(now, 2)
  }
  // ── "大后天"
  else if (/大后天/.test(norm)) {
    result = addDays(now, 3)
  }
  // ── "下周一" / "本周三"
  else if (/下(周|星期)(一|二|三|四|五|六|日|天)/.test(norm)) {
    const m = norm.match(/下(周|星期)(一|二|三|四|五|六|日|天)/)
    if (m) {
      const wd = ZH_WEEKDAY[m[2]] ?? 1
      result = nextWeekday(now, wd, 1)
    }
  } else if (/本(周|星期)(一|二|三|四|五|六|日|天)/.test(norm)) {
    const m = norm.match(/本(周|星期)(一|二|三|四|五|六|日|天)/)
    if (m) {
      const wd = ZH_WEEKDAY[m[2]] ?? 5
      const delta = (wd - now.getDay() + 7) % 7
      result = addDays(now, delta)
    }
  } else if (/下周|next week/.test(norm)) {
    result = addDays(now, 7)
  } else if (/这周|本周|this week/.test(norm)) {
    result = new Date(now)
  }
  // ── "月底" / "本月底"
  else if (/月底|月末|end of (this )?month/.test(norm)) {
    const dt = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 0)
    return { iso: iso(dt), matched: '月底', reason: 'parsed' }
  }
  // ── "下个工作日"
  else if (/下(一个)?工作日/.test(norm)) {
    let candidate = addDays(now, 1)
    while (candidate.getDay() === 0 || candidate.getDay() === 6) {
      candidate = addDays(candidate, 1)
    }
    result = candidate
  }
  // ── "现在" / "立刻" / "asap"
  else if (/现在|立刻|马上|asap/.test(norm)) {
    return { iso: iso(now), matched: '现在', reason: 'parsed' }
  }
  // ── "eod" / "今天下班前" → 今天 18:00
  else if (/eod|下班前|今天下班/.test(norm)) {
    const dt = new Date(now)
    dt.setHours(18, 0, 0, 0)
    return { iso: iso(dt), matched: 'eod', reason: 'parsed' }
  }
  // ── "一会儿后" / "稍后"
  else if (/一会儿|稍后|later/.test(norm)) {
    const dt = new Date(now.getTime() + 30 * 60_000)
    return { iso: iso(dt), matched: '稍后', reason: 'parsed' }
  }
  // ── "Q3" / "Q4"
  else if (/q([1-4])/i.test(norm)) {
    const q = Number(/q([1-4])/i.exec(norm)![1])
    const lastMonth = q * 3 - 1
    const dt = new Date(now.getFullYear(), lastMonth + 1, 0, 23, 59, 0)
    return { iso: iso(dt), matched: `Q${q}`, reason: 'parsed' }
  } else {
    return { iso: null, matched: null, reason: 'no-match' }
  }

  if (!result) {
    return { iso: null, matched: null, reason: 'no-match' }
  }

  // Apply time
  parseTime(result, norm, /晚上|下午|傍晚|pm/.test(norm) ? 14 : 9)
  return { iso: iso(result), matched: 'relative', reason: 'parsed' }
}

/**
 * Extract a list of relative-date expressions from a piece of text, returning
 * the first one as the primary ISO (most contexts only expect one).
 */
export function extractDueDate(text: string, now?: Date): string | null {
  const result = parseRelativeDate(text, now)
  return result.iso
}
