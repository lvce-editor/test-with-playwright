import { expect, test } from '@jest/globals'

const runTestsSource = new URL('../../test-with-playwright-worker/src/parts/RunTests/RunTests.ts', import.meta.url)
const { runTests } = await import(runTestsSource.href)
const browserSource = new URL(
  '../../test-with-playwright-worker/src/parts/StartBrowser/StartBrowser.ts',
  import.meta.url,
)
const { startBrowser } = await import(browserSource.href)
const stateSource = new URL('../../test-with-playwright-worker/src/parts/TestState/TestState.ts', import.meta.url)
const TestState = await import(stateSource.href)

test('fresh browsers discard prior origin state while preserving each scenario result', async () => {
  const browser = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'
  const controller = new AbortController()
  const sessions: any[] = []
  const results: any[] = []
  const disposedBeforeNext: boolean[] = []
  const browserHandles: any[] = []
  const createPage = async (): Promise<any> => {
    if (sessions.length > 0) {
      disposedBeforeNext.push(sessions.at(-1).page.isClosed() && !browserHandles.at(-1).isConnected())
    }
    const session = await startBrowser({ browser, headless: true, signal: controller.signal })
    sessions.push(session)
    browserHandles.push(session.page.context().browser())
    await session.page.route('**/tests/*.html', async (route: any) => {
      const first = route.request().url().endsWith('/first.html')
      await route.fulfill({
        body: `<script>
          const leaked = localStorage.getItem('previous-scenario');
          localStorage.setItem('previous-scenario', 'set');
          const state = ${first} || leaked ? 'fail' : 'pass';
          document.write('<div id="TestOverlay" data-state="' + state + '">' + state + '</div>');
        </script>`,
        contentType: 'text/html',
      })
    })
    return session
  }
  try {
    const firstSession = await createPage()
    let firstAvailable = true
    await runTests({
      browser,
      createPage: async () => {
        if (firstAvailable) {
          firstAvailable = false
          return firstSession
        }
        return createPage()
      },
      headless: true,
      onFinalResult: async () => {},
      onResult: async (result: any) => {
        results.push(result)
      },
      page: firstSession.page,
      port: 1234,
      tests: ['first.js', 'second.js'],
      testSrc: '/tests',
      timeout: 1000,
    })
    expect(results).toEqual([
      expect.objectContaining({ name: 'first.js', status: TestState.Fail }),
      expect.objectContaining({ name: 'second.js', status: TestState.Pass }),
    ])
    expect(sessions).toHaveLength(2)
    expect(sessions.every((session) => session.page.isClosed())).toBe(true)
    expect(browserHandles.every((handle) => !handle.isConnected())).toBe(true)
    expect(disposedBeforeNext).toEqual([true])
  } finally {
    await Promise.all(sessions.map((session) => session.dispose()))
    controller.abort()
  }
})
