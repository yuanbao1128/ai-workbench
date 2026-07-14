# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.ts >> Responsive Layout >> should show bottom nav on mobile
- Location: tests/e2e/responsive.spec.ts:13:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('仪表')
Expected: visible
Error: strict mode violation: getByText('仪表') resolved to 2 elements:
    1) <a href="/" class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors bg-blue-50 text-primary border-r-3 border-primary font-semibold">…</a> aka getByText('📊仪表盘')
    2) <a href="/" class="flex flex-col items-center gap-0.5 text-[10px] text-primary">…</a> aka getByRole('link', { name: '仪表' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('仪表')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e5]:
      - generic [ref=e7]:
        - heading "今日概览" [level=1] [ref=e8]
        - paragraph [ref=e9]: 2026年7月14日星期二
      - generic [ref=e10]:
        - generic [ref=e11]:
          - link "必须解决 0 今日必须完成的任务" [ref=e12] [cursor=pointer]:
            - /url: /tasks
            - heading "必须解决" [level=3] [ref=e15]
            - paragraph [ref=e16]: "0"
            - paragraph [ref=e17]: 今日必须完成的任务
          - link "重点关注 0 需要关注的任务" [ref=e18] [cursor=pointer]:
            - /url: /tasks
            - heading "重点关注" [level=3] [ref=e21]
            - paragraph [ref=e22]: "0"
            - paragraph [ref=e23]: 需要关注的任务
          - link "待追问 0 等待追问的委托" [ref=e24] [cursor=pointer]:
            - /url: /delegation
            - heading "待追问" [level=3] [ref=e27]
            - paragraph [ref=e28]: "0"
            - paragraph [ref=e29]: 等待追问的委托
          - link "待了解名词 0 保持学习" [ref=e30] [cursor=pointer]:
            - /url: /knowledge?type=TERM&status=UNKNOWN
            - heading "待了解名词" [level=3] [ref=e33]
            - paragraph [ref=e34]: "0"
            - paragraph [ref=e35]: 保持学习
        - generic [ref=e36]:
          - heading "AI 助手" [level=3] [ref=e37]
          - generic [ref=e38]:
            - textbox "输入消息... 如：记一下K8s不懂" [ref=e39]
            - button "发送" [ref=e40]
  - navigation [ref=e41]:
    - link "仪表" [ref=e42] [cursor=pointer]:
      - /url: /
      - img [ref=e43]
      - text: 仪表
    - link "知识" [ref=e48] [cursor=pointer]:
      - /url: /knowledge
      - img [ref=e49]
      - text: 知识
    - link "日程" [ref=e51] [cursor=pointer]:
      - /url: /tasks
      - img [ref=e52]
      - text: 日程
    - link "委托" [ref=e54] [cursor=pointer]:
      - /url: /delegation
      - img [ref=e55]
      - text: 委托
    - link "日报" [ref=e60] [cursor=pointer]:
      - /url: /reports
      - img [ref=e61]
      - text: 日报
  - alert [ref=e64]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Responsive Layout', () => {
  4  |   test('should show sidebar on desktop', async ({ page }) => {
  5  |     await page.setViewportSize({ width: 1280, height: 800 })
  6  |     await page.goto('/')
  7  | 
  8  |     await expect(page.getByText('AI 工作台')).toBeVisible()
  9  |     await expect(page.getByText('仪表盘')).toBeVisible()
  10 |     await expect(page.getByText('知识库')).toBeVisible()
  11 |   })
  12 | 
  13 |   test('should show bottom nav on mobile', async ({ page }) => {
  14 |     await page.setViewportSize({ width: 375, height: 800 })
  15 |     await page.goto('/')
  16 | 
  17 |     // Bottom nav should be visible on mobile
> 18 |     await expect(page.getByText('仪表')).toBeVisible()
     |                                        ^ Error: expect(locator).toBeVisible() failed
  19 |     await expect(page.getByText('知识')).toBeVisible()
  20 |     await expect(page.getByText('日程')).toBeVisible()
  21 |   })
  22 | })
```