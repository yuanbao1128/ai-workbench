# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Settings >> should open settings and save OpenAI config
- Location: tests/e2e/settings.spec.ts:4:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Settings', () => {
  4  |   test('should open settings and save OpenAI config', async ({ page }) => {
  5  |     // Settings button might be in header
  6  |     // Since we don't have a visible settings button on all pages, test via API
  7  |     const response = await page.request.put('/api/settings', {
  8  |       data: {
  9  |         apiProvider: 'openai',
  10 |         apiKey: 'sk-test-key',
  11 |         model: 'gpt-4o',
  12 |         baseUrl: '',
  13 |       },
  14 |     })
> 15 |     expect(response.ok()).toBeTruthy()
     |                           ^ Error: expect(received).toBeTruthy()
  16 | 
  17 |     const getResponse = await page.request.get('/api/settings')
  18 |     expect(getResponse.ok()).toBeTruthy()
  19 | 
  20 |     const settings = await getResponse.json()
  21 |     expect(settings.apiProvider).toBe('openai')
  22 |     expect(settings.model).toBe('gpt-4o')
  23 |   })
  24 | })
```