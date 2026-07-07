/**
 * Default follow-up time calculation rules:
 * - 9:00-17:00 transfers: first follow-up at +3 hours, second at 18:00 same day
 * - After 17:00 transfers: first follow-up at next day 10:00, second at next day 18:00
 * - User custom override takes priority
 */

export function calculateFollowUpTimes(customFollowUp?: string | null): Date[] {
  if (customFollowUp) {
    return [new Date(customFollowUp)]
  }

  const now = new Date()
  const hour = now.getHours()
  const times: Date[] = []

  if (hour >= 9 && hour < 17) {
    // During work hours: +3h, then 18:00
    const first = new Date(now)
    first.setHours(first.getHours() + 3)
    times.push(first)

    const second = new Date(now)
    second.setHours(18, 0, 0, 0)
    times.push(second)
  } else {
    // After hours: next day 10:00, then next day 18:00
    const nextDay = new Date(now)
    nextDay.setDate(nextDay.getDate() + 1)

    const first = new Date(nextDay)
    first.setHours(10, 0, 0, 0)
    times.push(first)

    const second = new Date(nextDay)
    second.setHours(18, 0, 0, 0)
    times.push(second)
  }

  return times
}

export function getDefaultFollowUpDescription(): string {
  const now = new Date()
  const hour = now.getHours()

  if (hour >= 9 && hour < 17) {
    return '3小时后 + 今天18:00'
  }
  return '明天10:00 + 明天18:00'
}