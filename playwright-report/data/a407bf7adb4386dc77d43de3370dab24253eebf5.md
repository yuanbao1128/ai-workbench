# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai-chat.spec.ts >> AI Chat >> should display chat interface and quick suggestions
- Location: tests/e2e/ai-chat.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('记名词')
Expected: visible
Error: strict mode violation: getByText('记名词') resolved to 2 elements:
    1) <p class="text-sm">可以帮你记名词、添加任务、转委托、查日程、生成周报</p> aka getByText('可以帮你记名词、添加任务、转委托、查日程、生成周报')
    2) <button class="shrink-0 px-3 py-1.5 text-xs rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">记名词</button> aka getByRole('button', { name: '记名词' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('记名词')

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
      - generic [ref=e25]:
        - generic [ref=e27]:
          - paragraph [ref=e28]: 👋 你好！我是你的 AI 助手
          - paragraph [ref=e29]: 可以帮你记名词、添加任务、转委托、查日程、生成周报
        - generic [ref=e30]:
          - button "记名词" [ref=e31]
          - button "添加TODO" [ref=e32]
          - button "转委托" [ref=e33]
          - button "查日程" [ref=e34]
          - button "生周报" [ref=e35]
        - generic [ref=e37]:
          - button "🎤" [ref=e38]
          - textbox "输入消息...（支持语音输入）" [ref=e39]
          - button "发送" [disabled] [ref=e40]
  - alert [ref=e41]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('AI Chat', () => {
  4  |   test('should display chat interface and quick suggestions', async ({ page }) => {
  5  |     await page.goto('/chat')
  6  |     await expect(page.getByText('AI 助手')).toBeVisible()
  7  | 
  8  |     // Quick suggestions
> 9  |     await expect(page.getByText('记名词')).toBeVisible()
     |                                         ^ Error: expect(locator).toBeVisible() failed
  10 |     await expect(page.getByText('添加TODO')).toBeVisible()
  11 |     await expect(page.getByText('转委托')).toBeVisible()
  12 |     await expect(page.getByText('查日程')).toBeVisible()
  13 |     await expect(page.getByText('生周报')).toBeVisible()
  14 |   })
  15 | 
  16 |   test('should send message and receive response', async ({ page }) => {
  17 |     await page.goto('/chat')
  18 | 
  19 |     await page.getByPlaceholder('输入消息...').fill('K8s 不太懂，记一下')
  20 |     await page.getByRole('button', { name: '发送' }).click()
  21 | 
  22 |     // Wait for response
  23 |     await page.waitForTimeout(3000)
  24 |     await expect(page.getByText(/已创建|K8s|术语/)).toBeVisible()
  25 |   })
  26 | })
```