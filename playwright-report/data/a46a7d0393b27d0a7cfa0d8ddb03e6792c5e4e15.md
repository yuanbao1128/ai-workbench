# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reports.spec.ts >> Reports >> should generate weekly report
- Location: tests/e2e/reports.spec.ts:13:7

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: '周报' }) resolved to 2 elements:
    1) <button class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-primary text-white hover:bg-primary-700 ">生成周报</button> aka getByRole('button', { name: '生成周报' })
    2) <button class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:bg-gray-100">周报</button> aka getByRole('button', { name: '周报', exact: true })

Call log:
  - waiting for getByRole('button', { name: '周报' })

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
          - heading "日报 & 周报" [level=1] [ref=e26]
          - generic [ref=e27]:
            - button "生成日报" [ref=e28]
            - button "生成周报" [ref=e29]
        - generic [ref=e30]:
          - button "全部" [ref=e31]
          - button "日报" [ref=e32]
          - button "周报" [ref=e33]
        - generic [ref=e34]: 加载中...
  - alert [ref=e35]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Reports', () => {
  4  |   test('should display reports page and generate daily report', async ({ page }) => {
  5  |     await page.goto('/reports')
  6  |     await expect(page.getByText('日报 & 周报')).toBeVisible()
  7  | 
  8  |     // Generate daily report
  9  |     await page.getByRole('button', { name: '生成日报' }).click()
  10 |     await expect(page.getByText(/日报|周报/)).toBeVisible()
  11 |   })
  12 | 
  13 |   test('should generate weekly report', async ({ page }) => {
  14 |     await page.goto('/reports')
  15 | 
  16 |     // Filter weekly
> 17 |     await page.getByRole('button', { name: '周报' }).click()
     |                                                    ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: '周报' }) resolved to 2 elements:
  18 |     await page.getByRole('button', { name: '生成周报' }).click()
  19 |     await expect(page.getByText(/周报/)).toBeVisible()
  20 |   })
  21 | })
```