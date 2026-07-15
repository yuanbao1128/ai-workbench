import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('should display today overview and quick chat entry', async ({ page }) => {
    await page.goto('/')

    // Header
    await expect(page.getByRole('heading', { name: '今日概览' })).toBeVisible()
    await expect(page.getByText('AI 助手')).toBeVisible()

    // Overview cards
    await expect(page.getByRole('link', { name: /必须解决/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /重点关注/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /待追问/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /待了解名词/ }).last()).toBeVisible()

    // Quick chat input
    await expect(page.getByPlaceholder('输入消息... 如：记一下K8s不懂')).toBeVisible()
  })

  test('should navigate to all main pages', async ({ page }) => {
    await page.goto('/')

    // Knowledge
    await page.getByRole('link', { name: '知识库' }).click()
    await expect(page).toHaveURL(/.*knowledge/)

    // Tasks
    await page.goto('/tasks')
    await expect(page.getByRole('heading', { name: '日程表' })).toBeVisible()

    // Delegation
    await page.goto('/delegation')
    await expect(page.getByRole('heading', { name: '委托跟进' })).toBeVisible()

    // Reports
    await page.goto('/reports')
    await expect(page.getByRole('heading', { name: '日报 & 周报' })).toBeVisible()
  })
})