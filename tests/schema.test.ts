import { describe, it, expect } from 'vitest'

describe('Prisma Schema', () => {
  it('should define all 7 models', () => {
    const fs = require('fs')
    const path = require('path')
    const schema = fs.readFileSync(
      path.resolve(__dirname, '..', 'prisma', 'schema.prisma'),
      'utf-8'
    )

    const models = ['Card', 'Task', 'LegacyIssue', 'Delegation', 'Activity', 'Report', 'Setting']
    for (const model of models) {
      expect(schema).toContain(`model ${model}`)
    }
  })

  it('should define all enums', () => {
    const fs = require('fs')
    const path = require('path')
    const schema = fs.readFileSync(
      path.resolve(__dirname, '..', 'prisma', 'schema.prisma'),
      'utf-8'
    )

    const enums = [
      'CardType', 'CardStatus', 'Priority', 'TaskStatus',
      'IssueStatus', 'DelegationStatus', 'ActivityType', 'ReportType'
    ]
    for (const e of enums) {
      expect(schema).toContain(`enum ${e}`)
    }
  })

  it('should have CardType enum with 5 values', () => {
    const fs = require('fs')
    const path = require('path')
    const schema = fs.readFileSync(
      path.resolve(__dirname, '..', 'prisma', 'schema.prisma'),
      'utf-8'
    )
    expect(schema).toContain('TERM')
    expect(schema).toContain('DESIGN')
    expect(schema).toContain('INSPIRATION')
    expect(schema).toContain('MEETING')
    expect(schema).toContain('QUESTION')
  })

  it('should have Priority enum with MUST, FOCUS, NORMAL', () => {
    const fs = require('fs')
    const path = require('path')
    const schema = fs.readFileSync(
      path.resolve(__dirname, '..', 'prisma', 'schema.prisma'),
      'utf-8'
    )
    expect(schema).toContain('MUST')
    expect(schema).toContain('FOCUS')
    expect(schema).toContain('NORMAL')
  })

  it('should have DelegationStatus with WAITING, ASKED, REPLIED, RESOLVED', () => {
    const fs = require('fs')
    const path = require('path')
    const schema = fs.readFileSync(
      path.resolve(__dirname, '..', 'prisma', 'schema.prisma'),
      'utf-8'
    )
    expect(schema).toContain('WAITING')
    expect(schema).toContain('ASKED')
    expect(schema).toContain('REPLIED')
    expect(schema).toContain('RESOLVED')
  })
})