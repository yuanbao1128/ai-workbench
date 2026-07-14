# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: delegation.spec.ts >> Delegation Tracking >> should create and display delegation
- Location: tests/e2e/delegation.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('委托跟进')
Expected: visible
Error: strict mode violation: getByText('委托跟进') resolved to 2 elements:
    1) <a href="/delegation" class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors bg-blue-50 text-primary border-r-3 border-primary font-semibold">…</a> aka getByRole('link', { name: '🔄 委托跟进' })
    2) <h1 class="text-2xl font-bold text-gray-900 mb-4">委托跟进</h1> aka getByRole('heading', { name: '委托跟进' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('委托跟进')

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
        - heading "委托跟进" [level=1] [ref=e25]
        - generic [ref=e26]:
          - button "全部" [ref=e27]
          - button "等待中" [ref=e28]
          - button "已解决" [ref=e29]
        - generic [ref=e30]: 加载中...
  - alert [ref=e31]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Delegation Tracking', () => {
  4  |   test('should create and display delegation', async ({ page }) => {
  5  |     const title = `委托-${Date.now()}`
  6  | 
  7  |     await page.request.post('/api/delegation', {
  8  |       data: { title, assignee: '王工' },
  9  |     })
  10 | 
  11 |     await page.goto('/delegation')
> 12 |     await expect(page.getByText('委托跟进')).toBeVisible()
     |                                          ^ Error: expect(locator).toBeVisible() failed
  13 |     await expect(page.getByText(title)).toBeVisible()
  14 |     await expect(page.getByText('王工')).toBeVisible()
  15 |   })
  16 | 
  17 |   test('should filter delegations by status', async ({ page }) => {
  18 |     await page.goto('/delegation')
  19 | 
  20 |     await page.getByRole('button', { name: '等待中' }).click()
  21 |     await page.getByRole('button', { name: '已解决' }).click()
  22 |     await page.getByRole('button', { name: '全部' }).click()
  23 |   })
  24 | })
```