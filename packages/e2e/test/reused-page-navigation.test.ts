import { expect, test } from '@jest/globals'
import { chromium, firefox, webkit } from '@playwright/test'

const workerSource = new URL('../../test-with-playwright-worker/src/parts/', import.meta.url)
const RunTestsWithReusedPage = await import(
  new URL('RunTestsWithReusedPage/RunTestsWithReusedPage.ts', workerSource).href
)
const TestState = await import(new URL('TestState/TestState.ts', workerSource).href)

test('reused page reports results while a background request remains pending', async () => {
  const browserName = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'
  const browserType = { chromium, firefox, webkit }[browserName]
  if (!browserType) {
    throw new Error(`Unsupported browser: ${browserName}`)
  }
  const browser = await browserType.launch({ headless: true })
  try {
    const page = await browser.newPage()
    let backgroundRequested = false
    await page.route('**/pending', () => {
      backgroundRequested = true
    })
    await page.route('**/tests/_all.html', async (route) => {
      await route.fulfill({
        body: `<script>fetch('/pending')</script><div class="TestResults">[{"name":"example.js","status":"pass","start":0,"end":1}]</div>`,
        contentType: 'text/html',
      })
    })
    const results: any[] = []
    await RunTestsWithReusedPage.runTestsWithReusedPage({
      onFinalResult: async () => {},
      onResult: async (result: any) => {
        results.push(result)
      },
      page,
      port: 1234,
      timeout: 1000,
    })
    expect(backgroundRequested).toBe(true)
    expect(results).toEqual([expect.objectContaining({ name: 'example.js', status: TestState.Pass })])
  } finally {
    await browser.close()
  }
})
