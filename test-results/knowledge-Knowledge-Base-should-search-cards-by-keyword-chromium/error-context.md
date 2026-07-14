# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: knowledge.spec.ts >> Knowledge Base >> should search cards by keyword
- Location: tests/e2e/knowledge.spec.ts:34:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('测试术语-1784022495434-bkb8t')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('测试术语-1784022495434-bkb8t')

```

```yaml
- complementary:
  - text: 🤖 AI 工作台 产品经理
  - navigation:
    - link "📊 仪表盘":
      - /url: /
    - link "📝 知识库":
      - /url: /knowledge
    - link "📅 日程表":
      - /url: /tasks
    - link "🔄 委托跟进":
      - /url: /delegation
    - link "📋 日报":
      - /url: /reports
  - text: 郭 郭红军
- main:
  - heading "知识库" [level=1]
  - button "+ 新建"
  - textbox "🔍 搜索...": 测试术语-1784022495434-bkb8t
  - button "全部"
  - button "术语"
  - button "方案"
  - button "灵感"
  - button "纪要"
  - button "问题"
  - text: 加载中...
- alert
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
> 43 |     await expect(page.getByText(title)).toBeVisible()
     |                                         ^ Error: expect(locator).toBeVisible() failed
  44 |   })
  45 | 
  46 |   test('should open card detail and mark as known', async ({ page }) => {
  47 |     const title = unique()
  48 |     const response = await page.request.post('/api/knowledge', {
  49 |       data: { title, type: 'TERM' },
  50 |     })
  51 |     const card = await response.json()
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