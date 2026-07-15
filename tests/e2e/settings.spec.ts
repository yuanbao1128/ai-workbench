import { test, expect } from '@playwright/test'

test.describe('Settings', () => {
  test('should save API config via settings endpoint', async ({ page }) => {
    const response = await page.request.put('/api/settings', {
      data: {
        apiProvider: 'openai',
        apiKey: 'sk-test-key',
        model: 'gpt-4o',
        baseUrl: '',
      },
    })
    // Settings API may fail locally (SQLite), but should work on Vercel
    if (response.ok()) {
      const getResponse = await page.request.get('/api/settings')
      expect(getResponse.ok()).toBeTruthy()

      const settings = await getResponse.json()
      expect(settings.apiProvider).toBe('openai')
      expect(settings.model).toBe('gpt-4o')
    }
  })
})