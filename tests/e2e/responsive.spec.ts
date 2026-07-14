import { test, expect } from '@playwright/test'

test.describe('Responsive Layout', () => {
  test('should show sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    await expect(page.getByText('AI 工作台')).toBeVisible()
    await expect(page.getByText('仪表盘')).toBeVisible()
    await expect(page.getByText('知识库')).toBeVisible()
  })

  test('should show bottom nav on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto('/')

    // Bottom nav should be visible on mobile
    await expect(page.getByText('仪表')).toBeVisible()
    await expect(page.getByText('知识')).toBeVisible()
    await expect(page.getByText('日程')).toBeVisible()
  })
})