# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard >> should display today overview and quick chat entry
- Location: tests/e2e/dashboard.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('待追问')
Expected: visible
Error: strict mode violation: getByText('待追问') resolved to 2 elements:
    1) <h3 class="font-semibold text-sm text-gray-900">待追问</h3> aka getByRole('link', { name: '待追问 0 等待追问的委托' })
    2) <p class="text-xs text-gray-400 mt-1">等待追问的委托</p> aka getByRole('link', { name: '待追问 0 等待追问的委托' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('待追问')

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
        - generic [ref=e26]:
          - heading "今日概览" [level=1] [ref=e27]
          - paragraph [ref=e28]: 2026年7月14日星期二
        - generic [ref=e29]:
          - generic [ref=e30]:
            - link "必须解决 0 今日必须完成的任务" [ref=e31] [cursor=pointer]:
              - /url: /tasks
              - heading "必须解决" [level=3] [ref=e34]
              - paragraph [ref=e35]: "0"
              - paragraph [ref=e36]: 今日必须完成的任务
            - link "重点关注 0 需要关注的任务" [ref=e37] [cursor=pointer]:
              - /url: /tasks
              - heading "重点关注" [level=3] [ref=e40]
              - paragraph [ref=e41]: "0"
              - paragraph [ref=e42]: 需要关注的任务
            - link "待追问 0 等待追问的委托" [ref=e43] [cursor=pointer]:
              - /url: /delegation
              - heading "待追问" [level=3] [ref=e46]
              - paragraph [ref=e47]: "0"
              - paragraph [ref=e48]: 等待追问的委托
            - link "待了解名词 0 保持学习" [ref=e49] [cursor=pointer]:
              - /url: /knowledge?type=TERM&status=UNKNOWN
              - heading "待了解名词" [level=3] [ref=e52]
              - paragraph [ref=e53]: "0"
              - paragraph [ref=e54]: 保持学习
          - generic [ref=e55]:
            - heading "AI 助手" [level=3] [ref=e56]
            - generic [ref=e57]:
              - textbox "输入消息... 如：记一下K8s不懂" [ref=e58]
              - button "发送" [ref=e59]
  - alert [ref=e60]
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
> 14 |     await expect(page.getByText('待追问')).toBeVisible()
     |                                         ^ Error: expect(locator).toBeVisible() failed
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
  30 |     await expect(page.getByText('日程表')).toBeVisible()
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