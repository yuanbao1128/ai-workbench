# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: knowledge.spec.ts >> Knowledge Base >> should open card detail and mark as known
- Location: tests/e2e/knowledge.spec.ts:46:7

# Error details

```
SyntaxError: Unexpected end of JSON input
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | const unique = () => `测试术语-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  4  | 
  5  | test.describe('Knowledge Base', () => {
  6  |   test('should create a term card and show it in the grid', async ({ page }) => {
  7  |     const title = unique()
  8  | 
  9  |     await page.goto('/knowledge')
  10 |     await expect(page.getByText('知识库')).toBeVisible()
  11 | 
  12 |     // Create card via API (simulating AI creation)
  13 |     const response = await page.request.post('/api/knowledge', {
  14 |       data: { title, type: 'TERM' },
  15 |     })
  16 |     expect(response.ok()).toBeTruthy()
  17 | 
  18 |     // Refresh and verify card appears
  19 |     await page.goto('/knowledge')
  20 |     await expect(page.getByText(title)).toBeVisible()
  21 |   })
  22 | 
  23 |   test('should filter cards by type and status', async ({ page }) => {
  24 |     await page.goto('/knowledge')
  25 | 
  26 |     // Click TERM filter tab
  27 |     await page.getByRole('button', { name: '术语' }).click()
  28 |     await expect(page.getByText('待了解')).toBeVisible()
  29 | 
  30 |     // Click ALL filter tab
  31 |     await page.getByRole('button', { name: '全部' }).first().click()
  32 |   })
  33 | 
  34 |   test('should search cards by keyword', async ({ page }) => {
  35 |     const title = unique()
  36 |     await page.request.post('/api/knowledge', {
  37 |       data: { title, type: 'TERM' },
  38 |     })
  39 | 
  40 |     await page.goto('/knowledge')
  41 |     await page.getByPlaceholder('搜索...').fill(title)
  42 | 
  43 |     await expect(page.getByText(title)).toBeVisible()
  44 |   })
  45 | 
  46 |   test('should open card detail and mark as known', async ({ page }) => {
  47 |     const title = unique()
  48 |     const response = await page.request.post('/api/knowledge', {
  49 |       data: { title, type: 'TERM' },
  50 |     })
> 51 |     const card = await response.json()
     |                  ^ SyntaxError: Unexpected end of JSON input
  52 | 
  53 |     await page.goto(`/knowledge/${card.id}`)
  54 |     await expect(page.getByText(title)).toBeVisible()
  55 | 
  56 |     // Mark as known
  57 |     await page.getByRole('button', { name: '标记为已了解' }).click()
  58 |     await expect(page.getByText('已了解')).toBeVisible()
  59 |   })
  60 | })
```