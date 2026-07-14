# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tasks.spec.ts >> Schedule & Legacy Issues >> should display week calendar and navigate weeks
- Location: tests/e2e/tasks.spec.ts:4:7

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
  3  | test.describe('Schedule & Legacy Issues', () => {
  4  |   test('should display week calendar and navigate weeks', async ({ page }) => {
  5  |     await page.goto('/tasks')
> 6  |     await expect(page.getByText('日程表')).toBeVisible()
     |                                         ^ Error: expect(locator).toBeVisible() failed
  7  | 
  8  |     // Calendar grid has 7 days
  9  |     await expect(page.getByText('一')).toBeVisible()
  10 |     await expect(page.getByText('日')).toBeVisible()
  11 | 
  12 |     // Navigate weeks
  13 |     await page.getByText('下周 →').click()
  14 |     await page.getByText('← 上周').click()
  15 |   })
  16 | 
  17 |   test('should create and complete a task', async ({ page }) => {
  18 |     const title = `测试任务-${Date.now()}`
  19 | 
  20 |     await page.request.post('/api/tasks', {
  21 |       data: { title, priority: 'MUST', dueDate: new Date().toISOString() },
  22 |     })
  23 | 
  24 |     await page.goto('/tasks')
  25 |     await expect(page.getByText(title)).toBeVisible()
  26 | 
  27 |     // Complete task
  28 |     await page.locator('input[type="checkbox"]').first().click()
  29 |   })
  30 | 
  31 |   test('should create and resolve legacy issue', async ({ page }) => {
  32 |     const title = `遗留问题-${Date.now()}`
  33 | 
  34 |     await page.request.post('/api/legacy-issues', {
  35 |       data: { title, plannedDate: new Date().toISOString() },
  36 |     })
  37 | 
  38 |     await page.goto('/tasks')
  39 |     await page.getByRole('button', { name: '遗留问题' }).click()
  40 |     await expect(page.getByText(title)).toBeVisible()
  41 |   })
  42 | })
```