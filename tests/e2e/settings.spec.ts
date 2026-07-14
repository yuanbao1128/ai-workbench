import { test, expect } from '@playwright/test'

test.describe('Settings', () => {
  test('should open settings and save OpenAI config', async ({ page }) => {
    // Settings button might be in header
    // Since we don't have a visible settings button on all pages, test via API
    const response = await page.request.put('/api/settings', {
      data: {
        apiProvider: 'openai',
        apiKey: 'sk-test-key',
        model: 'gpt-4o',
        baseUrl: '',
      },
    })
    expect(response.ok()).toBeTruthy()

    const getResponse = await page.request.get('/api/settings')
    expect(getResponse.ok()).toBeTruthy()

    const settings = await getResponse.json()
    expect(settings.apiProvider).toBe('openai')
    expect(settings.model).toBe('gpt-4o')
  })
})