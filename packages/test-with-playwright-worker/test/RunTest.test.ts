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
  const testOverlay = {
    _apiName: 'Locator',
    _expect: jest.fn(async () => ({ matches: true })),
    getAttribute: jest.fn(async (): Promise<string> => state),
    textContent: jest.fn(async (): Promise<string | null> => text),
  }
  return {
    goto: jest.fn(async (): Promise<void> => {}),
    locator: jest.fn(() => testOverlay),
  }
}

test('getUrlFromTestFile enables renderer worker tracing', () => {
  expect(getUrlFromTestFile('viewlet.explorer-open.js', 3000, false, true)).toBe(
    'http://localhost:3000/tests/viewlet.explorer-open.html?traceRendererWorker=true',
  )
})

test('getUrlFromTestFile combines tracing options', () => {
  expect(getUrlFromTestFile('viewlet.explorer-open.js', 3000, true, true)).toBe(
    'http://localhost:3000/tests/viewlet.explorer-open.html?traceFocus=true&traceRendererWorker=true',
  )
})

test('getUrlFromTestFile omits tracing options when disabled', () => {
  expect(getUrlFromTestFile('viewlet.explorer-open.js', 3000, false, false)).toBe(
    'http://localhost:3000/tests/viewlet.explorer-open.html',
  )
})

test('navigateToTest waits for the DOM instead of network idle', async () => {
  const goto = jest.fn(async (_url: string, _options: object): Promise<void> => {})
  const page = {
    goto,
  }

  await navigateToTest(page as any, 'http://localhost:3000/tests/about.open.html')

  expect(goto).toHaveBeenCalledWith('http://localhost:3000/tests/about.open.html', {
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
