import { expect, jest, test } from '@jest/globals'
import * as RunTests from '../src/parts/RunTests/RunTests.ts'

const createHarness = (browserName = 'webkit'): any => {
  const events: string[] = []
  let nextPage = 0
  const createPage = (): any => {
    const id = nextPage++
    const overlay = {
      _apiName: 'Locator',
      _expect: jest.fn(async () => ({ matches: true })),
      getAttribute: jest.fn(async () => (browserName === 'skip' ? 'skip' : 'pass')),
      textContent: jest.fn(async () => ''),
    }
    return {
      addInitScript: jest.fn(async () => {
        events.push(`trace-init ${id}`)
      }),
      context: () => ({ browser: () => browser }),
      goto: jest.fn(async () => {
        events.push(`navigate ${id}`)
      }),
      locator: () => overlay,
    }
  }
  const contexts: any[] = []
  const browser = {
    browserType: (): { name: () => string } => ({ name: (): string => browserName }),
    newContext: jest.fn(async () => {
      const context = {
        close: jest.fn(async () => {
          events.push('close')
        }),
        newPage: jest.fn(async () => createPage()),
      }
      contexts.push(context)
      return context
    }),
  }
  const page = createPage()
  const options = {
    headless: true,
    onFinalResult: jest.fn(async (_result: any) => {}),
    onResult: jest.fn(async (_result: any) => {
      events.push('result')
    }),
    page,
    port: 1234,
    tests: ['first.js', 'second.js'],
    testSrc: '/tests',
    timeout: 1000,
  }
  return { browser, contexts, events, options, page }
}

test('WebKit closes each test context before reporting its result and starting the next test', async () => {
  const { contexts, events, options, page } = createHarness()
  await RunTests.runTests(options)
  expect(events).toEqual(['navigate 1', 'close', 'result', 'navigate 2', 'close', 'result'])
  expect(page.goto).not.toHaveBeenCalled()
  expect(contexts).toHaveLength(2)
  expect(options.onFinalResult).toHaveBeenCalledWith(expect.objectContaining({ failed: 0, passed: 2, skipped: 0 }))
})

test('WebKit closes a context if page creation fails', async () => {
  const { browser, options } = createHarness()
  const close = jest.fn(async () => {})
  browser.newContext.mockResolvedValue({
    close,
    newPage: async () => {
      throw new Error('page creation failed')
    },
  })
  await expect(RunTests.runTests(options)).rejects.toThrow('page creation failed')
  expect(close).toHaveBeenCalledTimes(1)
  expect(options.onResult).not.toHaveBeenCalled()
})

test('WebKit reports a failed test once and closes its context before continuing', async () => {
  const { browser, contexts, events, options } = createHarness()
  const newContext = browser.newContext.getMockImplementation()
  browser.newContext.mockImplementationOnce(async () => {
    const context = await newContext()
    context.newPage.mockResolvedValue({
      goto: async () => {
        throw new Error('navigation failed')
      },
    })
    return context
  })
  await RunTests.runTests(options)
  expect(contexts).toHaveLength(2)
  expect(events).toEqual(['close', 'result', 'navigate 1', 'close', 'result'])
  expect(options.onFinalResult).toHaveBeenCalledWith(expect.objectContaining({ failed: 1, passed: 1, skipped: 0 }))
})

test.each(['chromium', 'firefox'])('%s keeps using the supplied page', async (browserName) => {
  const { browser, options, page } = createHarness(browserName)
  await RunTests.runTests(options)
  expect(browser.newContext).not.toHaveBeenCalled()
  expect(page.goto).toHaveBeenCalledTimes(2)
})

test('a persistent Chromium context without a Browser keeps the supplied page', async () => {
  const { options, page } = createHarness()
  page.context = (): { browser: () => null } => ({ browser: (): null => null })
  await RunTests.runTests(options)
  expect(page.goto).toHaveBeenCalledTimes(2)
})

test('filtered-out tests do not create contexts or report results', async () => {
  const { browser, options } = createHarness()
  await RunTests.runTests({ ...options, filter: 'missing' })
  expect(browser.newContext).not.toHaveBeenCalled()
  expect(options.onResult).not.toHaveBeenCalled()
  expect(options.onFinalResult).toHaveBeenCalledWith(expect.objectContaining({ failed: 0, passed: 0, skipped: 0 }))
})

test('skipped overlays are counted without being reported as passes', async () => {
  const { options } = createHarness('skip')
  await RunTests.runTests(options)
  expect(options.onFinalResult).toHaveBeenCalledWith(expect.objectContaining({ failed: 0, passed: 0, skipped: 2 }))
})

test('tracing exports from the supplied page for non-WebKit browsers', async () => {
  const { events, options, page } = createHarness('firefox')
  page.evaluate = jest.fn(async (): Promise<object> => {
    events.push('trace-export')
    return { text: undefined, timeline: undefined }
  })
  await RunTests.runTests({ ...options, rendererWorkerTraceDirectory: '/unused', traceFocus: true })
  expect(events).toEqual(['navigate 0', 'trace-export', 'result', 'navigate 0', 'trace-export', 'result'])
  expect(page.addInitScript).not.toHaveBeenCalled()
})

test('screenshot capture failures still close the WebKit context', async () => {
  const { contexts, options } = createHarness()
  await RunTests.runTests({
    ...options,
    svgScreenshotOptions: { directory: '/unused', name: 'webkit', update: false },
    tests: ['first.js'],
  })
  expect(contexts[0].close).toHaveBeenCalledTimes(1)
  expect(options.onFinalResult).toHaveBeenCalledWith(expect.objectContaining({ failed: 1, passed: 0, skipped: 0 }))
})
