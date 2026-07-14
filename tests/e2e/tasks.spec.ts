import { test, expect } from '@playwright/test'

test.describe('Schedule & Legacy Issues', () => {
  test('should display week calendar and navigate weeks', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByRole('heading', { name: '日程表' })).toBeVisible()

    // Calendar grid has 7 days
    await expect(page.getByText('一')).toBeVisible()
    await expect(page.getByText('日')).toBeVisible()

    // Navigate weeks
    await page.getByText('下周 →').click()
    await page.getByText('← 上周').click()
  })

  test('should create and complete a task', async ({ page }) => {
    const title = `测试任务-${Date.now()}`

    await page.request.post('/api/tasks', {
      data: { title, priority: 'MUST', dueDate: new Date().toISOString() },
    })

    await page.goto('/tasks')
    await expect(page.getByText(title)).toBeVisible()

    // Complete task
    await page.locator('input[type="checkbox"]').first().click()
  })

  test('should create and resolve legacy issue', async ({ page }) => {
    const title = `遗留问题-${Date.now()}`

    await page.request.post('/api/legacy-issues', {
      data: { title, plannedDate: new Date().toISOString() },
    })

    await page.goto('/tasks')
    await page.getByRole('button', { name: '遗留问题' }).click()
    await expect(page.getByText(title)).toBeVisible()
  })
})