import { describe, it, expect } from 'vitest'

// Note: We test the Prisma schema and client generation,
// not the actual DB connection (requires DATABASE_URL)

describe('Prisma ORM Configuration', () => {
  it('should have prisma as a devDependency', () => {
    const pkg = require('../package.json')
    expect(pkg.devDependencies).toHaveProperty('prisma')
  })

  it('should have @prisma/client as a dependency', () => {
    const pkg = require('../package.json')
    expect(pkg.dependencies).toHaveProperty('@prisma/client')
  })

  it('should have prisma schema file', () => {
    const fs = require('fs')
    const path = require('path')
    const schemaPath = path.resolve(__dirname, '..', 'prisma', 'schema.prisma')
    expect(fs.existsSync(schemaPath)).toBe(true)
  })
})