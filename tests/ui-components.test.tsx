import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../src/components/ui/Badge'
import { Button } from '../src/components/ui/Button'
import { Dot } from '../src/components/ui/Dot'
import { Tag } from '../src/components/ui/Tag'
import { Tab } from '../src/components/ui/Tab'

describe('UI Components', () => {
  describe('Badge', () => {
    it('renders with text', () => {
      render(<Badge variant="red">5</Badge>)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('applies red variant class', () => {
      render(<Badge variant="red">5</Badge>)
      const el = screen.getByText('5')
      expect(el.className).toContain('bg-red')
    })

    it('applies green variant class', () => {
      render(<Badge variant="green">OK</Badge>)
      const el = screen.getByText('OK')
      expect(el.className).toContain('bg-green')
    })
  })

  describe('Button', () => {
    it('renders primary button', () => {
      render(<Button variant="primary">提交</Button>)
      expect(screen.getByText('提交')).toBeInTheDocument()
    })

    it('renders ghost button', () => {
      render(<Button variant="ghost">取消</Button>)
      expect(screen.getByText('取消')).toBeInTheDocument()
    })

    it('calls onClick handler', () => {
      let clicked = false
      render(<Button variant="primary" onClick={() => { clicked = true }}>点击</Button>)
      screen.getByText('点击').click()
      expect(clicked).toBe(true)
    })
  })

  describe('Dot', () => {
    it('renders red dot', () => {
      const { container } = render(<Dot color="red" />)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('bg-red')
    })

    it('renders green dot', () => {
      const { container } = render(<Dot color="green" />)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('bg-green')
    })
  })

  describe('Tag', () => {
    it('renders with text', () => {
      render(<Tag>K8s</Tag>)
      expect(screen.getByText('K8s')).toBeInTheDocument()
    })
  })

  describe('Tab', () => {
    it('renders active tab', () => {
      render(<Tab active>日程表</Tab>)
      const el = screen.getByText('日程表')
      expect(el.className).toContain('bg-primary')
    })

    it('renders inactive tab', () => {
      render(<Tab active={false}>遗留问题</Tab>)
      const el = screen.getByText('遗留问题')
      expect(el.className).not.toContain('bg-primary')
    })
  })
})