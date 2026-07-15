import { test, expect } from '@playwright/test'

test.describe('Delegation Tracking', () => {
  test('should create and display delegation', async ({ page }) => {
    const title = `委托-${Date.now()}`

    await page.request.post('/api/delegation', {
      data: { title, assignee: '王工' },
    })

    await page.goto('/delegation')
    await expect(page.getByRole('heading', { name: '委托跟进' })).toBeVisible()
    await expect(page.getByText(title)).toBeVisible()
    await expect(page.getByText('王工').first()).toBeVisible()
  })

  test('should filter delegations by status', async ({ page }) => {
    await page.goto('/delegation')

    await page.getByRole('button', { name: '等待中' }).click()
    await page.getByRole('button', { name: '已解决' }).click()
    await page.getByRole('button', { name: '全部' }).click()
  })
})