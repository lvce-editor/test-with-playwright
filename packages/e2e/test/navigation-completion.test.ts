import { expect, test } from '@jest/globals'
import { chromium, firefox, webkit, type Response } from '@playwright/test'
import { setTimeout as delay } from 'node:timers/promises'

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
          <div id="TestOverlay" data-state="${state}">${state === 'fail' ? 'scenario failed' : 'scenario passed'}</div>`,
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
        error: state === 'fail' ? 'scenario failed' : 'scenario passed',
        name: 'example.js',
        status: state === 'fail' ? TestState.Fail : TestState.Pass,
      }),
    ])
    expect(await page.evaluate(() => (globalThis as any).domReady)).toBe(browserName !== 'webkit')
  } finally {
    await browser.close()
  }
})

test('completion wait reports a timeout when the renderer stops responding', async () => {
  const browserName = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'
  const browserType = { chromium, firefox, webkit }[browserName]
  if (!browserType) {
    throw new Error(`Unsupported browser: ${browserName}`)
  }
  const browser = await browserType.launch({ headless: true })
  const deadline = new AbortController()
  try {
    const page = await browser.newPage()
    await page.route('**/tests/example.html', async (route) => {
      await route.fulfill({ body: '<div id="TestOverlay" data-state="pass">passed</div>', contentType: 'text/html' })
    })
    const goto = page.goto.bind(page)
    page.goto = async (url, options): Promise<Response | null> => {
      const response = await goto(url, options)
      await page.evaluate(() => {
        // Fault injection blocks the renderer past the completion deadline, then allows browser cleanup.
        // eslint-disable-next-line e2e/no-timeouts
        setTimeout(() => {
          const end = performance.now() + 4000
          while (performance.now() < end) {
            // Deliberately freeze the real renderer before the completion wait starts.
          }
        }, 0)
      })
      await delay(100)
      return response
    }
    const results: any[] = []
    const enforceDeadline = async (): Promise<never> => {
      await delay(8000, undefined, { signal: deadline.signal })
      throw new Error('Completion wait ignored its timeout')
    }
    await Promise.race([
      runTests({
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
      }),
      enforceDeadline(),
    ])
    expect(results).toEqual([
      expect.objectContaining({ error: expect.stringContaining('Timeout 1000ms exceeded'), status: TestState.Fail }),
    ])
    expect(results[0].end - results[0].start).toBeLessThan(5000)
  } finally {
    deadline.abort()
    await browser.close()
  }
})
