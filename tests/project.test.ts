import { describe, it, expect } from 'vitest'

describe('Project Initialization', () => {
  it('should have the correct project name', () => {
    const pkg = require('../package.json')
    expect(pkg.name).toBe('ai-workbench')
  })

  it('should have all required scripts', () => {
    const pkg = require('../package.json')
    expect(pkg.scripts).toHaveProperty('dev')
    expect(pkg.scripts).toHaveProperty('build')
    expect(pkg.scripts).toHaveProperty('test')
  })

  it('should have required dependencies', () => {
    const pkg = require('../package.json')
    expect(pkg.dependencies).toHaveProperty('next')
    expect(pkg.dependencies).toHaveProperty('react')
    expect(pkg.dependencies).toHaveProperty('react-dom')
    expect(pkg.dependencies).toHaveProperty('@prisma/client')
    expect(pkg.dependencies).toHaveProperty('@anthropic-ai/sdk')
  })

  it('should have required devDependencies', () => {
    const pkg = require('../package.json')
    expect(pkg.devDependencies).toHaveProperty('typescript')
    expect(pkg.devDependencies).toHaveProperty('tailwindcss')
    expect(pkg.devDependencies).toHaveProperty('vitest')
    expect(pkg.devDependencies).toHaveProperty('prisma')
  })
})