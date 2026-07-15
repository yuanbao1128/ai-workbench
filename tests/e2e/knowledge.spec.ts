import { test, expect } from '@playwright/test'

const unique = () => `测试术语-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

test.describe('Knowledge Base', () => {
  test('should create a term card and show it in the grid', async ({ page }) => {
    const title = unique()

    await page.goto('/knowledge')
    await expect(page.getByRole('heading', { name: '知识库' })).toBeVisible()

    // Create card via API
    const response = await page.request.post('/api/knowledge', {
      data: { title, type: 'TERM' },
    })
    expect(response.ok()).toBeTruthy()

    // Refresh and verify
    await page.goto('/knowledge')
    await expect(page.getByText(title)).toBeVisible()
  })

  test('should filter cards by type and status', async ({ page }) => {
    await page.goto('/knowledge')

    await page.getByRole('button', { name: '术语' }).click()
    await page.getByRole('button', { name: '全部' }).first().click()
  })

  test('should search cards by keyword', async ({ page }) => {
    const title = unique()
    await page.request.post('/api/knowledge', {
      data: { title, type: 'TERM' },
    })

    await page.goto('/knowledge')
    await page.getByPlaceholder('搜索...').fill(title)
    // Wait for search results
    await page.waitForTimeout(500)
    await expect(page.getByText(title)).toBeVisible()
  })

  test('should open card detail and mark as known', async ({ page }) => {
    const title = unique()
    const response = await page.request.post('/api/knowledge', {
      data: { title, type: 'TERM' },
    })
    const card = await response.json()

    await page.goto(`/knowledge/${card.id}`)
    // Wait for the card detail to load
    await page.waitForTimeout(1000)
    await expect(page.getByText(title)).toBeVisible()

    // Mark as known
    await page.getByRole('button', { name: '标记为已了解' }).click()
    await expect(page.getByText('已了解')).toBeVisible()
  })
})