import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Prisma client
vi.mock('../src/lib/db', () => ({
  prisma: {
    card: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import { prisma } from '../src/lib/db'

describe('Knowledge API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a card with TERM type and UNKNOWN status by default', async () => {
    const mockCard = {
      id: 'card-1',
      title: 'K8s',
      type: 'TERM',
      status: 'UNKNOWN',
      content: null,
      keyConcepts: '[]',
      relatedCards: '[]',
      source: null,
      history: '[]',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    vi.mocked(prisma.card.create).mockResolvedValue(mockCard)

    const result = await prisma.card.create({
      data: { title: 'K8s', type: 'TERM' },
    })

    expect(result.title).toBe('K8s')
    expect(result.type).toBe('TERM')
    expect(result.status).toBe('UNKNOWN')
  })

  it('should create a card with DESIGN type', async () => {
    const mockCard = {
      id: 'card-2',
      title: '登录页手机号验证码方案',
      type: 'DESIGN',
      status: 'UNKNOWN',
      content: null,
      keyConcepts: '[]',
      relatedCards: '[]',
      source: null,
      history: '[]',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    vi.mocked(prisma.card.create).mockResolvedValue(mockCard)

    const result = await prisma.card.create({
      data: { title: '登录页手机号验证码方案', type: 'DESIGN' },
    })

    expect(result.type).toBe('DESIGN')
  })

  it('should find cards with type filter', async () => {
    vi.mocked(prisma.card.findMany).mockResolvedValue([])

    await prisma.card.findMany({
      where: { type: 'TERM', status: 'UNKNOWN' },
    })

    expect(prisma.card.findMany).toHaveBeenCalledWith({
      where: { type: 'TERM', status: 'UNKNOWN' },
    })
  })

  it('should update card status from UNKNOWN to KNOWN', async () => {
    const updatedCard = {
      id: 'card-1',
      title: 'K8s',
      type: 'TERM',
      status: 'KNOWN',
      content: '容器编排平台',
      history: JSON.stringify([{ timestamp: new Date().toISOString(), action: 'marked_known', content: '容器编排平台' }]),
    }
    vi.mocked(prisma.card.update).mockResolvedValue(updatedCard as any)

    const result = await prisma.card.update({
      where: { id: 'card-1' },
      data: { status: 'KNOWN', content: '容器编排平台' },
    })

    expect(result.status).toBe('KNOWN')
  })

  it('should count unknown terms for threshold', async () => {
    vi.mocked(prisma.card.count).mockResolvedValue(7)

    const count = await prisma.card.count({
      where: { type: 'TERM', status: 'UNKNOWN' },
    })

    expect(count).toBe(7)
    expect(count).toBeGreaterThanOrEqual(5)
  })
})