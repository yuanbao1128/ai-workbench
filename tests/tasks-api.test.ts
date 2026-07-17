import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getWeekStart, getWeekEnd } from '../src/lib/date-utils'

// Mock the Prisma client
vi.mock('../src/lib/db', () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    delegation: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '../src/lib/db'

describe('GET /api/tasks - v2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 5.7: week parameter - filter tasks within a week range
  it('should filter tasks by week param using Monday-Sunday range', async () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', type: 'SCHEDULE', priority: 'MUST', status: 'PENDING', dueDate: new Date('2026-07-15T10:00:00Z'), relatedCards: '[]', createdAt: new Date(), completedAt: null },
      { id: '2', title: 'Task 2', type: 'SCHEDULE', priority: 'FOCUS', status: 'PENDING', dueDate: new Date('2026-07-16T10:00:00Z'), relatedCards: '[]', createdAt: new Date(), completedAt: null },
    ]
    vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks)

    // 2026-07-15 is a Wednesday. Week should be Mon 7/13 - Sun 7/19
    const refDate = new Date('2026-07-15')
    const expectedStart = getWeekStart(refDate)
    const expectedEnd = getWeekEnd(refDate)

    const { GET } = await import('../src/app/api/tasks/route')
    const url = new URL('http://localhost/api/tasks?week=2026-07-15')
    const req = new Request(url)
    const res = await GET(req as any)

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dueDate: {
            gte: expectedStart,
            lte: expectedEnd,
          },
        }),
      })
    )

    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
  })

  // 5.7: date parameter - filter tasks on a specific date
  it('should filter tasks by exact date param', async () => {
    const mockTasks = [
      { id: '1', title: 'Today Task', type: 'SCHEDULE', priority: 'MUST', status: 'PENDING', dueDate: new Date('2026-07-17'), relatedCards: '[]', createdAt: new Date(), completedAt: null },
    ]
    vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks)

    const { GET } = await import('../src/app/api/tasks/route')
    const url = new URL('http://localhost/api/tasks?date=2026-07-17')
    const req = new Request(url)
    const res = await GET(req as any)

    // Should filter dueDate between start and end of 2026-07-17 (local timezone)
    const expectedStart = new Date(2026, 6, 17, 0, 0, 0, 0)  // July=6 (0-indexed)
    const expectedEnd = new Date(2026, 6, 17, 23, 59, 59, 999)
    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dueDate: {
            gte: expectedStart,
            lte: expectedEnd,
          },
        }),
      })
    )

    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(1)
  })

  // 5.7: include=follow-ups — also fetch follow-up items
  it('should include follow-ups when include=follow-ups param is set', async () => {
    const mockTasks = [
      { id: '1', title: 'Schedule Task', type: 'SCHEDULE', priority: 'NORMAL', status: 'PENDING', dueDate: new Date('2026-07-17'), relatedCards: '[]', createdAt: new Date(), completedAt: null },
    ]
    const mockTodoTasks = [
      { id: '2', title: 'TODO Item', type: 'TODO', priority: 'NORMAL', status: 'PENDING', dueDate: new Date('2026-07-17'), relatedCards: '[]', createdAt: new Date(), completedAt: null },
    ]
    const mockDelegations = [
      {
        id: 'd1', title: 'Follow up with Alice', assignee: 'Alice', source: 'Meeting',
        status: 'WAITING', priority: 'NORMAL',
        followUpTimes: JSON.stringify(['2026-07-17T10:00:00Z']),
        customFollowUp: null, conclusion: null, timeline: '[]',
        createdAt: new Date(), resolvedAt: null,
      },
    ]

    // First call: regular tasks, second call: TODO tasks
    vi.mocked(prisma.task.findMany)
      .mockResolvedValueOnce(mockTasks)     // SCHEDULE tasks
      .mockResolvedValueOnce(mockTodoTasks)  // TODO tasks
    vi.mocked(prisma.delegation.findMany).mockResolvedValue(mockDelegations)

    const { GET } = await import('../src/app/api/tasks/route')
    const url = new URL('http://localhost/api/tasks?date=2026-07-17&include=follow-ups')
    const req = new Request(url)
    const res = await GET(req as any)

    const data = await res.json()
    expect(data).toHaveProperty('tasks')
    expect(data).toHaveProperty('followUps')
    expect(data.tasks).toHaveLength(1)
    expect(data.followUps).toHaveLength(2) // 1 TODO + 1 delegation

    // Check TODO follow-up
    expect(data.followUps[0]).toMatchObject({
      id: '2',
      title: 'TODO Item',
      type: 'todo',
    })

    // Check delegation follow-up
    expect(data.followUps[1]).toMatchObject({
      id: 'd1',
      title: 'Follow up with Alice',
      type: 'delegation',
      assignee: 'Alice',
    })
  })

  // 5.7: include=follow-ups without date/week still works
  it('should include follow-ups with existing from/to params', async () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', type: 'SCHEDULE', priority: 'NORMAL', status: 'PENDING', dueDate: null, relatedCards: '[]', createdAt: new Date(), completedAt: null },
    ]
    vi.mocked(prisma.task.findMany)
      .mockResolvedValueOnce(mockTasks)
      .mockResolvedValueOnce([])  // no TODOs
    vi.mocked(prisma.delegation.findMany).mockResolvedValue([])

    const { GET } = await import('../src/app/api/tasks/route')
    const url = new URL('http://localhost/api/tasks?from=2026-07-13&to=2026-07-19&include=follow-ups')
    const req = new Request(url)
    const res = await GET(req as any)

    const data = await res.json()
    expect(data).toHaveProperty('tasks')
    expect(data).toHaveProperty('followUps')
  })

  // Backward compatibility: without include=follow-ups
  it('should return flat array when include param is not set (backward compat)', async () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', type: 'SCHEDULE', priority: 'NORMAL', status: 'PENDING', dueDate: null, relatedCards: '[]', createdAt: new Date(), completedAt: null },
    ]
    vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks)

    const { GET } = await import('../src/app/api/tasks/route')
    const url = new URL('http://localhost/api/tasks')
    const req = new Request(url)
    const res = await GET(req as any)

    const data = await res.json()
    // Without include param, should return flat array (backward compat)
    expect(Array.isArray(data)).toBe(true)
  })

  // week param should take precedence over from/to
  it('should use week param over from/to when both are present', async () => {
    vi.mocked(prisma.task.findMany).mockResolvedValue([])

    const { GET } = await import('../src/app/api/tasks/route')
    const url = new URL('http://localhost/api/tasks?week=2026-07-15&from=2026-06-01&to=2026-06-30')
    const req = new Request(url)
    await GET(req as any)

    // Week param should compute Mon-Sun range, ignoring from/to
    const expectedStart = getWeekStart(new Date('2026-07-15'))
    const expectedEnd = getWeekEnd(new Date('2026-07-15'))

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dueDate: {
            gte: expectedStart,
            lte: expectedEnd,
          },
        }),
      })
    )
  })

  // Existing priority/status filters still work
  it('should combine week param with existing priority filter', async () => {
    vi.mocked(prisma.task.findMany).mockResolvedValue([])

    const { GET } = await import('../src/app/api/tasks/route')
    const url = new URL('http://localhost/api/tasks?week=2026-07-15&priority=MUST')
    const req = new Request(url)
    await GET(req as any)

    const expectedStart = getWeekStart(new Date('2026-07-15'))
    const expectedEnd = getWeekEnd(new Date('2026-07-15'))

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          priority: 'MUST',
          dueDate: {
            gte: expectedStart,
            lte: expectedEnd,
          },
        },
      })
    )
  })
})
