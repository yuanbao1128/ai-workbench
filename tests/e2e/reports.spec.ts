import { test, expect } from '@playwright/test'

test.describe('Reports', () => {
  test('should display reports page and generate daily report', async ({ page }) => {
    await page.goto('/reports')
    await expect(page.getByText('日报 & 周报')).toBeVisible()

    // Generate daily report
    await page.getByRole('button', { name: '生成日报' }).click()
    await expect(page.getByText(/日报|周报/)).toBeVisible()
  })

  test('should generate weekly report', async ({ page }) => {
    await page.goto('/reports')

    // Filter weekly
    await page.getByRole('button', { name: '周报' }).click()
    await page.getByRole('button', { name: '生成周报' }).click()
    await expect(page.getByText(/周报/)).toBeVisible()
  })
})