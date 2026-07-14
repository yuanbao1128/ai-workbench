# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard >> should navigate to all main pages
- Location: tests/e2e/dashboard.spec.ts:21:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('日程表')
Expected: visible
Error: strict mode violation: getByText('日程表') resolved to 3 elements:
    1) <a href="/tasks" class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors bg-blue-50 text-primary border-r-3 border-primary font-semibold">…</a> aka getByRole('link', { name: '📅 日程表' })
    2) <h1 class="text-2xl font-bold text-gray-900 mb-4">日程表</h1> aka getByRole('heading', { name: '日程表' })
    3) <button class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors bg-primary text-white">日程表</button> aka getByRole('button', { name: '日程表' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('日程表')

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
        - heading "日程表" [level=1] [ref=e25]
        - generic [ref=e26]:
          - button "日程表" [ref=e27]
          - button "遗留问题" [ref=e28]
        - generic [ref=e29]: 加载中...
  - alert [ref=e30]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Dashboard', () => {
  4  |   test('should display today overview and quick chat entry', async ({ page }) => {
  5  |     await page.goto('/')
  6  | 
  7  |     // Header
  8  |     await expect(page.getByText('今日概览')).toBeVisible()
  9  |     await expect(page.getByText('AI 助手')).toBeVisible()
  10 | 
  11 |     // Overview cards
  12 |     await expect(page.getByText('必须解决')).toBeVisible()
  13 |     await expect(page.getByText('重点关注')).toBeVisible()
  14 |     await expect(page.getByText('待追问')).toBeVisible()
  15 |     await expect(page.getByText('待了解名词')).toBeVisible()
  16 | 
  17 |     // Quick chat input
  18 |     await expect(page.getByPlaceholder('输入消息... 如：记一下K8s不懂')).toBeVisible()
  19 |   })
  20 | 
  21 |   test('should navigate to all main pages', async ({ page }) => {
  22 |     await page.goto('/')
  23 | 
  24 |     // Knowledge
  25 |     await page.getByText('知识库').first().click()
  26 |     await expect(page).toHaveURL(/.*knowledge/)
  27 | 
  28 |     // Tasks
  29 |     await page.goto('/tasks')
> 30 |     await expect(page.getByText('日程表')).toBeVisible()
     |                                         ^ Error: expect(locator).toBeVisible() failed
  31 | 
  32 |     // Delegation
  33 |     await page.goto('/delegation')
  34 |     await expect(page.getByText('委托跟进')).toBeVisible()
  35 | 
  36 |     // Reports
  37 |     await page.goto('/reports')
  38 |     await expect(page.getByText('日报 & 周报')).toBeVisible()
  39 |   })
  40 | })
```