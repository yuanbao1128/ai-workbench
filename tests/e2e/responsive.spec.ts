import { test, expect } from '@playwright/test'

test.describe('Responsive Layout', () => {
  test('should show sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    await expect(page.getByRole('link', { name: '仪表盘' })).toBeVisible()
    await expect(page.getByRole('link', { name: '知识库' })).toBeVisible()
  })

  test('should show bottom nav on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto('/')

    // Bottom nav with specific labels
    await expect(page.getByRole('link', { name: '仪表' })).toBeVisible()
    await expect(page.getByRole('link', { name: '知识' })).toBeVisible()
    await expect(page.getByRole('link', { name: '日程' })).toBeVisible()
  })
})