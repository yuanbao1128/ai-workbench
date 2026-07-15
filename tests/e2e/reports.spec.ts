import { test, expect } from '@playwright/test'

test.describe('Reports', () => {
  test('should display reports page and generate daily report', async ({ page }) => {
    await page.goto('/reports')
    await expect(page.getByRole('heading', { name: '日报 & 周报' })).toBeVisible()

    // Generate daily report
    await page.getByRole('button', { name: '生成日报' }).click()
    await page.waitForTimeout(2000)
  })

  test('should generate weekly report', async ({ page }) => {
    await page.goto('/reports')

    // Filter weekly tab
    await page.getByRole('button', { name: '周报', exact: true }).click()
    await page.getByRole('button', { name: '生成周报' }).click()
    await page.waitForTimeout(2000)
  })
})