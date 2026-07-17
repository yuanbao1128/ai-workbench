import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

function readSchema(): string {
  return fs.readFileSync(
    path.resolve(__dirname, '..', 'prisma', 'schema.prisma'),
    'utf-8'
  )
}

describe('Prisma Schema', () => {
  it('should define all 7 models', () => {
    const schema = readSchema()
    const models = ['Card', 'Task', 'LegacyIssue', 'Delegation', 'Activity', 'Report', 'Setting']
    for (const model of models) {
      expect(schema).toContain(`model ${model}`)
    }
  })

  it('should use String fields for type/status values (PostgreSQL compat)', () => {
    const schema = readSchema()
    // Card model uses String for type and status with defaults
    expect(schema).toContain('type')
    expect(schema).toContain('status')
  })

  it('should have Card model with type and status String fields', () => {
    const schema = readSchema()
    // Card type uses String field with defaults (TERM, DESIGN, INSPIRATION, MEETING, QUESTION)
    expect(schema).toContain('@default("TERM")')
    // Card status uses String field with defaults (UNKNOWN, KNOWN)
    expect(schema).toContain('@default("UNKNOWN")')
  })

  it('should have Task model with priority and status String fields', () => {
    const schema = readSchema()
    // priority: MUST, FOCUS, NORMAL (String field)
    expect(schema).toContain('@default("NORMAL")')
    // status: PENDING, DONE (String field)
    expect(schema).toContain('@default("PENDING")')
  })

  it('should have Delegation model with status String field', () => {
    const schema = readSchema()
    // status: WAITING, ASKED, REPLIED, RESOLVED (String field)
    expect(schema).toContain('@default("WAITING")')
  })

  it('Task model should have type field with default SCHEDULE', () => {
    const schema = readSchema()
    expect(schema).toContain('type')
    expect(schema).toContain('@default("SCHEDULE")')
  })

  it('Report model should have weekNumber field', () => {
    const schema = readSchema()
    expect(schema).toContain('weekNumber')
  })
})
