import { expect, jest, test } from '@jest/globals'
import { getUrlFromTestFile, navigateToTest, runTest } from '../src/parts/RunTest/RunTest.ts'
import * as TestState from '../src/parts/TestState/TestState.ts'

const createPage = ({
  state = 'pass',
  text = '',
}: {
  readonly state?: string
  readonly text?: string | null
} = {}): any => {
  const listeners = new Map<string, Set<(value: any) => void>>()
  const testOverlay = {
    getAttribute: jest.fn(async (): Promise<string> => state),
    textContent: jest.fn(async (): Promise<string | null> => text),
    waitFor: jest.fn(async (): Promise<void> => {}),
  }
  return {
    emit: (event: string, value: any): void => {
      const eventListeners = listeners.get(event) || []
      for (const listener of eventListeners) {
        listener(value)
      }
    },
    goto: jest.fn(async (): Promise<void> => {}),
    locator: jest.fn(() => testOverlay),
    off: jest.fn((event: string, listener: (value: any) => void) => listeners.get(event)?.delete(listener)),
    on: jest.fn((event: string, listener: (value: any) => void) => {
      let eventListeners = listeners.get(event)
      if (!eventListeners) {
        eventListeners = new Set()
        listeners.set(event, eventListeners)
      }
      eventListeners.add(listener)
    }),
  }
}

test('getUrlFromTestFile enables renderer worker tracing', () => {
  expect(getUrlFromTestFile('viewlet.explorer-open.js', 3000, false, true)).toBe(
    'http://127.0.0.1:3000/tests/viewlet.explorer-open.html?traceRendererWorker=true',
  )
})

test('getUrlFromTestFile combines tracing options', () => {
  expect(getUrlFromTestFile('viewlet.explorer-open.js', 3000, true, true)).toBe(
    'http://127.0.0.1:3000/tests/viewlet.explorer-open.html?traceFocus=true&traceRendererWorker=true',
  )
})

test('getUrlFromTestFile omits tracing options when disabled', () => {
  expect(getUrlFromTestFile('viewlet.explorer-open.js', 3000, false, false)).toBe(
    'http://127.0.0.1:3000/tests/viewlet.explorer-open.html',
  )
})

test('navigateToTest waits for the DOM instead of network idle', async () => {
  const goto = jest.fn(async (_url: string, _options: object): Promise<void> => {})
  const page = {
    goto,
  }

  await navigateToTest(page as any, 'http://127.0.0.1:3000/tests/about.open.html')

  expect(goto).toHaveBeenCalledWith('http://127.0.0.1:3000/tests/about.open.html', {
    waitUntil: 'domcontentloaded',
  })
})

test('runTest reports SVG screenshot capture errors for a passing overlay', async () => {
  const page = createPage()
  const svgScreenshotOptions = {
    directory: '/tmp/screenshots',
    name: 'chromium',
    update: false,
  }

  const result = await runTest({
    page,
    port: 3000,
    svgScreenshotOptions,
    test: 'about.open.js',
    testSrc: '/tmp/tests',
    timeout: 1000,
    traceFocus: true,
    traceRendererWorker: true,
  })

  expect(result).toMatchObject({
    error: expect.stringContaining('Failed to capture SVG screenshot'),
    name: 'about.open.js',
    status: TestState.Fail,
  })
})

test('runTest reports a passing overlay without an SVG screenshot', async () => {
  const page = createPage({ text: null })

  const result = await runTest({
    page,
    port: 3000,
    test: 'about.open.js',
    testSrc: '/tmp/tests',
    timeout: 1000,
  })

  expect(result.status).toBe(TestState.Pass)
})

test('runTest fails on console warnings, errors, and uncaught page errors and removes listeners', async () => {
  const page = createPage()
  page.goto.mockImplementation(async () => {
    page.emit('console', {
      location: () => ({ columnNumber: 3, lineNumber: 2, url: 'http://127.0.0.1/test.js' }),
      text: () => 'warning text',
      type: () => 'warning',
    })
    page.emit('console', {
      location: () => ({ columnNumber: 0, lineNumber: 0, url: '' }),
      text: () => 'error text',
      type: () => 'error',
    })
    page.emit('pageerror', new Error('uncaught test error'))
    page.emit('pageerror', { message: 'uncaught error without stack' })
  })

  const result = await runTest({
    failOnConsoleMessages: true,
    page,
    port: 3000,
    test: 'about.open.js',
    testSrc: '/tmp/tests',
    timeout: 1000,
  })

  expect(result).toMatchObject({
    error: expect.stringContaining('Browser console messages:'),
    status: TestState.Fail,
  })
  expect(result.error).toContain('console warning: warning text (http://127.0.0.1/test.js:2:3)')
  expect(result.error).toContain('console error: error text')
  expect(result.error).toContain('uncaught page error: Error: uncaught test error')
  expect(result.error).toContain('uncaught page error: uncaught error without stack')
  expect(page.off).toHaveBeenCalledTimes(2)
  expect(page.emit).toBeDefined()
})

test('runTest ignores console events when failOnConsoleMessages is disabled', async () => {
  const page = createPage()
  page.goto.mockImplementation(async () => {
    page.emit('console', {
      location: () => ({ columnNumber: 0, lineNumber: 0, url: '' }),
      text: () => 'warning text',
      type: () => 'warning',
    })
  })

  const result = await runTest({
    page,
    port: 3000,
    test: 'about.open.js',
    testSrc: '/tmp/tests',
    timeout: 1000,
  })

  expect(result.status).toBe(TestState.Pass)
  expect(page.on).not.toHaveBeenCalled()
})

test('runTest ignores ordinary console output when failOnConsoleMessages is enabled', async () => {
  const page = createPage()
  page.goto.mockImplementation(async () => {
    page.emit('console', {
      location: () => ({ columnNumber: 0, lineNumber: 0, url: '' }),
      text: () => 'ordinary log output',
      type: () => 'log',
    })
  })

  const result = await runTest({
    failOnConsoleMessages: true,
    page,
    port: 3000,
    test: 'about.open.js',
    testSrc: '/tmp/tests',
    timeout: 1000,
  })

  expect(result.status).toBe(TestState.Pass)
  expect(page.off).toHaveBeenCalledTimes(2)
})

test('runTest retains scenario failures alongside console diagnostics', async () => {
  const page = createPage({ state: 'fail', text: 'scenario failed' })
  page.goto.mockImplementation(async () => {
    page.emit('console', {
      location: () => ({ columnNumber: 0, lineNumber: 0, url: '' }),
      text: () => 'console failure',
      type: () => 'error',
    })
  })

  const result = await runTest({
    failOnConsoleMessages: true,
    page,
    port: 3000,
    test: 'about.open.js',
    testSrc: '/tmp/tests',
    timeout: 1000,
  })

  expect(result.error).toContain('scenario failed\nBrowser console messages:')
  expect(result.error).toContain('console error: console failure')
  expect(result.status).toBe(TestState.Fail)
})

test('runTest does not carry console messages into the next test', async () => {
  const page = createPage()
  page.goto.mockImplementationOnce(async () => {
    page.emit('console', {
      location: () => ({ columnNumber: 0, lineNumber: 0, url: '' }),
      text: () => 'first test warning',
      type: () => 'warning',
    })
  })

  const firstResult = await runTest({
    failOnConsoleMessages: true,
    page,
    port: 3000,
    test: 'first.js',
    testSrc: '/tmp/tests',
    timeout: 1000,
  })
  const secondResult = await runTest({
    failOnConsoleMessages: true,
    page,
    port: 3000,
    test: 'second.js',
    testSrc: '/tmp/tests',
    timeout: 1000,
  })

  expect(firstResult).toMatchObject({ error: expect.stringContaining('first test warning'), status: TestState.Fail })
  expect(secondResult).toMatchObject({ error: '', status: TestState.Pass })
})

test('runTest reports a failed overlay without capturing a screenshot', async () => {
  const page = createPage({
    state: 'fail',
    text: 'expected true to be false',
  })

  const result = await runTest({
    page,
    port: 3000,
    svgScreenshotOptions: {
      directory: '/tmp/screenshots',
      name: 'chromium',
      update: false,
    },
    test: 'about.open.js',
    testSrc: '/tmp/tests',
    timeout: 1000,
  })

  expect(result).toMatchObject({
    error: 'expected true to be false',
    status: TestState.Fail,
  })
})

test('runTest reports navigation errors', async () => {
  const page = createPage()
  page.goto.mockRejectedValue(new Error('navigation failed'))

  const result = await runTest({
    page,
    port: 3000,
    test: 'about.open.js',
    testSrc: '/tmp/tests',
    timeout: 1000,
  })

  expect(result).toMatchObject({
    error: 'navigation failed',
    status: TestState.Fail,
  })
})

test('runTest stringifies non-error failures', async () => {
  const page = createPage()
  page.goto.mockRejectedValue('navigation failed')

  const result = await runTest({
    page,
    port: 3000,
    test: 'about.open.js',
    testSrc: '/tmp/tests',
    timeout: 1000,
  })

  expect(result).toMatchObject({
    error: 'navigation failed',
    status: TestState.Fail,
  })
})

test.each(['chromium', 'firefox', 'webkit'])(
  'runTest waits for %s navigation and still reports scenario failure',
  async (browser) => {
    const page = createPage({ state: 'fail', text: 'scenario failed' })

    const result = await runTest({
      browser,
      page,
      port: 3000,
      test: 'about.open.js',
      testSrc: '/tmp/tests',
      timeout: 1000,
    })

    expect(page.goto).toHaveBeenCalledWith('http://127.0.0.1:3000/tests/about.open.html', {
      waitUntil: browser === 'webkit' ? 'commit' : 'domcontentloaded',
    })
    expect(page.locator).toHaveBeenCalledWith('#TestOverlay')
    expect(result).toMatchObject({ error: 'scenario failed', status: TestState.Fail })
  },
)

test('WebKit commit still fails when the completion overlay cannot be read', async () => {
  const page = createPage()
  page.locator().textContent.mockRejectedValue(new Error('completion overlay unavailable'))

  const result = await runTest({
    browser: 'webkit',
    page,
    port: 3000,
    test: 'about.open.js',
    testSrc: '/tmp/tests',
    timeout: 1000,
  })

  expect(result).toMatchObject({ error: 'completion overlay unavailable', status: TestState.Fail })
})
