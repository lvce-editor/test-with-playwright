import { expect, test } from '@jest/globals'
import { chromium, firefox, webkit } from '@playwright/test'

const source = new URL('../../test-with-playwright-worker/src/parts/RunTests/RunTests.ts', import.meta.url)
const { runTests } = await import(source.href)
const stateSource = new URL('../../test-with-playwright-worker/src/parts/TestState/TestState.ts', import.meta.url)
const TestState = await import(stateSource.href)

test.each(['pass', 'fail'])('navigation waits for scenario completion and preserves %s results', async (state) => {
  const browserName = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'
  const browserType = { chromium, firefox, webkit }[browserName]
  if (!browserType) {
    throw new Error(`Unsupported browser: ${browserName}`)
  }
  const browser = await browserType.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.route('**/pending.js', () => {})
    await page.route('**/tests/example.html', async (route) => {
      await route.fulfill({
        body: `<script>window.domReady = false; document.addEventListener('DOMContentLoaded', () => { window.domReady = true })</script>
          ${browserName === 'webkit' ? '<script defer src="/pending.js"></script>' : ''}
          <div id="TestOverlay" data-state="${state}">${state === 'fail' ? 'scenario failed' : ''}</div>`,
        contentType: 'text/html',
      })
    })
    const results: any[] = []
    await runTests({
      browser: browserName,
      headless: true,
      onFinalResult: async () => {},
      onResult: async (result: any) => {
        results.push(result)
      },
      page,
      port: 1234,
      tests: ['example.js'],
      testSrc: '/tests',
      timeout: 1000,
    })
    expect(results).toEqual([
      expect.objectContaining({
        error: state === 'fail' ? 'scenario failed' : '',
        name: 'example.js',
        status: state === 'fail' ? TestState.Fail : TestState.Pass,
      }),
    ])
    if (browserName === 'webkit') {
      expect(await page.evaluate(() => (window as any).domReady)).toBe(false)
    }
  } finally {
    await browser.close()
  }
})
