import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickSuggestions } from '../src/components/chat/QuickSuggestions'

describe('QuickSuggestions - v2', () => {
  it('should render default suggestions', () => {
    const onClick = vi.fn()
    render(<QuickSuggestions onSuggestionClick={onClick} />)

    expect(screen.getByText('记名词')).toBeDefined()
    expect(screen.getByText('添加TODO')).toBeDefined()
    expect(screen.getByText('转委托')).toBeDefined()
    expect(screen.getByText('查日程')).toBeDefined()
    expect(screen.getByText('生周报')).toBeDefined()
  })

  it('should render dashboard-specific suggestions', () => {
    const onClick = vi.fn()
    render(<QuickSuggestions page="dashboard" onSuggestionClick={onClick} />)

    expect(screen.getByText('记名词')).toBeDefined()
    expect(screen.getByText('加TODO')).toBeDefined()
    expect(screen.getByText('转委托')).toBeDefined()
    expect(screen.getByText('查今天')).toBeDefined()
  })

  it('should render knowledge-specific suggestions', () => {
    const onClick = vi.fn()
    render(<QuickSuggestions page="knowledge" onSuggestionClick={onClick} />)

    expect(screen.getByText('记名词')).toBeDefined()
    expect(screen.getByText('查名词')).toBeDefined()
  })

  it('should render tasks-specific suggestions', () => {
    const onClick = vi.fn()
    render(<QuickSuggestions page="tasks" onSuggestionClick={onClick} />)

    expect(screen.getByText('加任务')).toBeDefined()
    expect(screen.getByText('查今天')).toBeDefined()
  })

  it('should call onSuggestionClick with the prompt text when clicked', () => {
    const onClick = vi.fn()
    render(<QuickSuggestions page="dashboard" onSuggestionClick={onClick} />)

    fireEvent.click(screen.getByText('记名词'))
    expect(onClick).toHaveBeenCalledWith('K8s 不太懂，记一下')
  })

  it('should call onSuggestionClick with correct prompt for 加TODO', () => {
    const onClick = vi.fn()
    render(<QuickSuggestions page="dashboard" onSuggestionClick={onClick} />)

    fireEvent.click(screen.getByText('加TODO'))
    expect(onClick).toHaveBeenCalledWith('今天要完成需求文档，记一下')
  })
})
