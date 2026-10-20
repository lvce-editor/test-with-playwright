import { expect, test } from '@jest/globals'
import { chromium, firefox, webkit } from '@playwright/test'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// Import worker internals at runtime: these integration tests exercise a separate
// workspace, whose private modules are not part of the published runner API.
const workerParts = new URL('../../test-with-playwright-worker/src/parts/', import.meta.url)
const { runTest } = await import(new URL('RunTest/RunTest.ts', workerParts).href)
const { runTestsWithReusedPage } = await import(
  new URL('RunTestsWithReusedPage/RunTestsWithReusedPage.ts', workerParts).href
)
const TestState = await import(new URL('TestState/TestState.ts', workerParts).href)

// Serve the renderer-side protocol in a small document so capture and filesystem
// failures are exercised through the real Playwright binding, before final results.
const html = (reused: boolean, changed: boolean): string => `<!doctype html>
<style>button { width: ${changed ? 150 : 100}px; height: 30px; }</style><button>About</button>
<script>
(async () => {
  let status = 'pass', error = '';
  globalThis.lvceScreenshotTargets = new Map([['target', document.querySelector('button')]]);
  try { await globalThis.lvceMatchScreenshot('about.svg', 'target'); }
  catch (e) { status = 'fail'; error = e.message; }
  const output = document.createElement('div');
  output.id = 'TestOverlay'; output.dataset.state = status;
  output.textContent = error || 'passed';
  document.body.append(output);
  if (${reused}) {
    const results = document.createElement('div'); results.className = 'TestResults';
    results.textContent = JSON.stringify([{ name: 'about.js', status, error, start: 0, end: 1 }]);
    document.body.append(results);
  }
})();
</script>`

test.each([false, true])('awaitable SVG capture works with reused page=%s', async (reused) => {
  const directory = await mkdtemp(join(tmpdir(), 'matcher-e2e-'))
  const browserName = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'
  const browserType = { chromium, firefox, webkit }[browserName]
  if (!browserType) {
    throw new Error(`Unsupported browser: ${browserName}`)
  }
  const browser = await browserType.launch({ headless: true })
  try {
    let changed = false
    const execute = async (update: boolean): Promise<any[]> => {
      const page = await browser.newPage()
      try {
        await page.route('**/*', (route) => route.fulfill({ body: html(reused, changed), contentType: 'text/html' }))
        if (!reused) {
          return [
            await runTest({
              page,
              port: 3000,
              test: 'about.js',
              testSrc: join(directory, 'src'),
              timeout: 10_000,
              updateSvgScreenshots: update,
            }),
          ]
        }
        const results: any[] = []
        await runTestsWithReusedPage({
          browser: browserName,
          onFinalResult: async () => {},
          onResult: async (result: any) => {
            results.push(result)
          },
          page,
          port: 3000,
          testPath: directory,
          timeout: 10_000,
          updateSvgScreenshots: update,
        })
        return results
      } finally {
        await page.close()
      }
    }
    const missing = await execute(false)
    expect(missing[0].status).toBe(TestState.Fail)
    expect(missing[0].error).toContain('SVG screenshot is missing:')
    const result1 = await execute(true)
    expect(result1[0].status).toBe(TestState.Pass)
    const fixture = join(directory, 'fixtures/about.svg')
    const baseline = await readFile(fixture, 'utf8')
    expect(baseline.length).toBeLessThan(100_000)
    const result2 = await execute(false)
    expect(result2[0].status).toBe(TestState.Pass)
    const result3 = await execute(false)
    expect(result3[0].status).toBe(TestState.Pass)
    changed = true
    const mismatch = await execute(false)
    expect(mismatch[0].status).toBe(TestState.Fail)
    expect(mismatch[0].error).toContain('SVG screenshot differs:')
    expect(await readFile(fixture, 'utf8')).toBe(baseline)
    const result4 = await execute(true)
    expect(result4[0].status).toBe(TestState.Pass)
    expect(await readFile(fixture, 'utf8')).not.toBe(baseline)
    const result5 = await execute(false)
    expect(result5[0].status).toBe(TestState.Pass)
  } finally {
    await browser.close()
    await rm(directory, { force: true, recursive: true })
  }
})
