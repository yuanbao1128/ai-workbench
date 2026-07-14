# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: knowledge.spec.ts >> Knowledge Base >> should create a term card and show it in the grid
- Location: tests/e2e/knowledge.spec.ts:6:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('知识库')
Expected: visible
Error: strict mode violation: getByText('知识库') resolved to 2 elements:
    1) <a href="/knowledge" class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors bg-blue-50 text-primary border-r-3 border-primary font-semibold">…</a> aka getByRole('link', { name: '📝 知识库' })
    2) <h1 class="text-2xl font-bold text-gray-900">知识库</h1> aka getByRole('heading', { name: '知识库' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('知识库')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]: 🤖 AI 工作台
        - generic [ref=e7]: 产品经理
      - navigation [ref=e8]:
        - link "📊 仪表盘" [ref=e9] [cursor=pointer]:
          - /url: /
          - generic [ref=e10]: 📊
          - text: 仪表盘
        - link "📝 知识库" [ref=e11] [cursor=pointer]:
          - /url: /knowledge
          - generic [ref=e12]: 📝
          - text: 知识库
        - link "📅 日程表" [ref=e13] [cursor=pointer]:
          - /url: /tasks
          - generic [ref=e14]: 📅
          - text: 日程表
        - link "🔄 委托跟进" [ref=e15] [cursor=pointer]:
          - /url: /delegation
          - generic [ref=e16]: 🔄
          - text: 委托跟进
        - link "📋 日报" [ref=e17] [cursor=pointer]:
          - /url: /reports
          - generic [ref=e18]: 📋
          - text: 日报
      - generic [ref=e20]:
        - generic [ref=e21]: 郭
        - text: 郭红军
    - main [ref=e22]:
      - generic [ref=e24]:
        - generic [ref=e25]:
          - heading "知识库" [level=1] [ref=e26]
          - button "+ 新建" [ref=e27]
        - generic [ref=e28]:
          - textbox "🔍 搜索..." [ref=e29]
          - generic [ref=e30]:
            - button "全部" [ref=e31]
            - button "术语" [ref=e32]
            - button "方案" [ref=e33]
            - button "灵感" [ref=e34]
            - button "纪要" [ref=e35]
            - button "问题" [ref=e36]
        - generic [ref=e37]: 加载中...
  - alert [ref=e38]
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
> 10 |     await expect(page.getByText('知识库')).toBeVisible()
     |                                         ^ Error: expect(locator).toBeVisible() failed
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