import { test, expect } from '@playwright/test'

test.describe('AI Chat', () => {
  test('should display chat interface and quick suggestions', async ({ page }) => {
    await page.goto('/chat')
    await expect(page.getByText('AI 助手')).toBeVisible()

    // Quick suggestions
    await expect(page.getByText('记名词')).toBeVisible()
    await expect(page.getByText('添加TODO')).toBeVisible()
    await expect(page.getByText('转委托')).toBeVisible()
    await expect(page.getByText('查日程')).toBeVisible()
    await expect(page.getByText('生周报')).toBeVisible()
  })

  test('should send message and receive response', async ({ page }) => {
    await page.goto('/chat')

    await page.getByPlaceholder('输入消息...').fill('K8s 不太懂，记一下')
    await page.getByRole('button', { name: '发送' }).click()

    // Wait for response
    await page.waitForTimeout(3000)
    await expect(page.getByText(/已创建|K8s|术语/)).toBeVisible()
  })
})