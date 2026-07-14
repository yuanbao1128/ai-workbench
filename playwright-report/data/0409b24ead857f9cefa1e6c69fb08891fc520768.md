# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tasks.spec.ts >> Schedule & Legacy Issues >> should create and resolve legacy issue
- Location: tests/e2e/tasks.spec.ts:31:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('遗留问题-1784022504999')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('遗留问题-1784022504999')

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
  - heading "日程表" [level=1]
  - button "日程表"
  - button "遗留问题"
  - text: 加载中...
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Schedule & Legacy Issues', () => {
  4  |   test('should display week calendar and navigate weeks', async ({ page }) => {
  5  |     await page.goto('/tasks')
  6  |     await expect(page.getByText('日程表')).toBeVisible()
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
> 40 |     await expect(page.getByText(title)).toBeVisible()
     |                                         ^ Error: expect(locator).toBeVisible() failed
  41 |   })
  42 | })
```