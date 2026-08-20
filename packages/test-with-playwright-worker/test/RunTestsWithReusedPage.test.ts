import { expect, jest, test } from '@jest/globals'
import * as RunTestsWithReusedPage from '../src/parts/RunTestsWithReusedPage/RunTestsWithReusedPage.ts'
import * as TestState from '../src/parts/TestState/TestState.ts'

const createPage = (text: string): any => {
  const testResults = {
    textContent: jest.fn(async (): Promise<string> => text),
    waitFor: jest.fn(async (): Promise<void> => {}),
  }
  return {
    evaluate: jest.fn(async (): Promise<undefined> => undefined),
    goto: jest.fn(async (): Promise<void> => {}),
    locator: jest.fn(() => testResults),
    waitForFunction: jest.fn(async (callback: (selector: string) => boolean, selector: string): Promise<void> => {
      const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
      try {
        for (const element of [undefined, { textContent: '' }, { textContent: text }]) {
          Object.defineProperty(globalThis, 'document', {
            configurable: true,
            value: {
              querySelector: (): typeof element => element,
            },
          })
          callback(selector)
        }
      } finally {
        if (originalDocument) {
          Object.defineProperty(globalThis, 'document', originalDocument)
        } else {
          delete (globalThis as any).document
        }
      }
    }),
  }
}

test('runTestsWithReusedPage navigates once and reports parsed results', async () => {
  const page = createPage(
    JSON.stringify([
      {
        end: 5,
        name: 'test-A.js',
        start: 1,
        status: 'pass',
      },
      {
        end: 10,
        error: 'nope',
        name: 'test-B.js',
        start: 6,
        status: 'fail',
      },
      {
        end: 12,
        name: 'test-C.js',
        start: 11,
        status: 'skip',
      },
    ]),
  )
  const onResult = jest.fn(async (_result: any): Promise<void> => {})
  const onFinalResult = jest.fn(async (_result: any): Promise<void> => {})

  await RunTestsWithReusedPage.runTestsWithReusedPage({
    filter: 'A',
    onFinalResult,
    onResult,
    page,
    port: 1234,
    timeout: 1000,
    traceFocus: true,
  })

  expect(page.goto).toHaveBeenCalledTimes(1)
  expect(page.goto).toHaveBeenCalledWith('http://localhost:1234/tests/_all.html?traceFocus=true&filter=A', {
    timeout: 1000,
    waitUntil: 'networkidle',
  })
  expect(page.locator).toHaveBeenCalledWith('.TestResults')
  expect(page.waitForFunction).toHaveBeenCalledTimes(1)
  expect(onResult.mock.calls).toHaveLength(3)
  expect(onResult.mock.calls.at(0)?.[0]).toMatchObject({
    error: '',
    name: 'test-A.js',
    status: TestState.Pass,
  })
  expect(onResult.mock.calls.at(1)?.[0]).toMatchObject({
    error: 'nope',
    name: 'test-B.js',
    status: TestState.Fail,
  })
  expect(onResult.mock.calls.at(2)?.[0]).toMatchObject({
    error: '',
    name: 'test-C.js',
    status: TestState.Skip,
  })
  expect(onFinalResult.mock.calls.at(0)?.[0]).toMatchObject({
    failed: 1,
    passed: 1,
    skipped: 1,
  })
})

test('runTestsWithReusedPage enables and exports renderer worker tracing', async () => {
  const page = createPage(
    JSON.stringify([
      {
        end: 5,
        name: 'test-A.js',
        start: 1,
        status: 'pass',
      },
    ]),
  )
  const onResult = jest.fn(async (_result: any): Promise<void> => {})
  const onFinalResult = jest.fn(async (_result: any): Promise<void> => {})

  await RunTestsWithReusedPage.runTestsWithReusedPage({
    onFinalResult,
    onResult,
    page,
    port: 1234,
    rendererWorkerTraceDirectory: '/tmp/renderer-worker-traces',
    timeout: 1000,
  })

  expect(page.goto).toHaveBeenCalledWith(
    'http://localhost:1234/tests/_all.html?traceRendererWorker=true',
    expect.anything(),
  )
  expect(page.evaluate).toHaveBeenCalledTimes(1)
})

test('runTestsWithReusedPage reports invalid json as _all.html failure', async () => {
  const page = createPage('{')
  const onResult = jest.fn(async (_result: any): Promise<void> => {})
  const onFinalResult = jest.fn(async (_result: any): Promise<void> => {})

  await RunTestsWithReusedPage.runTestsWithReusedPage({
    onFinalResult,
    onResult,
    page,
    port: 1234,
    timeout: 1000,
  })

  expect(page.goto).toHaveBeenCalledTimes(1)
  expect(page.goto).toHaveBeenCalledWith('http://localhost:1234/tests/_all.html', {
    timeout: 1000,
    waitUntil: 'networkidle',
  })
  expect(onResult.mock.calls).toHaveLength(1)
  expect(onResult.mock.calls.at(0)?.[0]).toMatchObject({
    name: '_all.html',
    status: TestState.Fail,
  })
  expect(onFinalResult.mock.calls.at(0)?.[0]).toMatchObject({
    failed: 1,
    passed: 0,
    skipped: 0,
  })
})

test.each([
  ['a non-array result', '{}'],
  ['a non-object test result', '[null]'],
  ['an invalid test status', '[{"end":2,"name":"test.js","start":1,"status":"running"}]'],
  ['a non-string test name', '[{"end":2,"name":1,"start":1,"status":"pass"}]'],
  ['a non-number end time', '[{"end":"2","name":"test.js","start":1,"status":"pass"}]'],
  ['a non-finite end time', '[{"end":1e999,"name":"test.js","start":1,"status":"pass"}]'],
])('runTestsWithReusedPage reports %s as _all.html failure', async (_name, text) => {
  const page = createPage(text)
  const onResult = jest.fn(async (_result: any): Promise<void> => {})
  const onFinalResult = jest.fn(async (_result: any): Promise<void> => {})

  await RunTestsWithReusedPage.runTestsWithReusedPage({
    onFinalResult,
    onResult,
    page,
    port: 1234,
    timeout: 1000,
  })

  expect(onResult.mock.calls.at(0)?.[0]).toMatchObject({
    name: '_all.html',
    status: TestState.Fail,
  })
})

test('runTestsWithReusedPage reports empty test results', async () => {
  const page = createPage('')
  const onResult = jest.fn(async (_result: any): Promise<void> => {})
  const onFinalResult = jest.fn(async (_result: any): Promise<void> => {})

  await RunTestsWithReusedPage.runTestsWithReusedPage({
    onFinalResult,
    onResult,
    page,
    port: 1234,
    timeout: 1000,
  })

  expect(onResult.mock.calls.at(0)?.[0]).toMatchObject({
    error: 'TestResults is empty',
    status: TestState.Fail,
  })
})

test('runTestsWithReusedPage stringifies non-error navigation failures', async () => {
  const page = createPage('[]')
  page.goto.mockRejectedValue('navigation failed')
  const onResult = jest.fn(async (_result: any): Promise<void> => {})
  const onFinalResult = jest.fn(async (_result: any): Promise<void> => {})

  await RunTestsWithReusedPage.runTestsWithReusedPage({
    onFinalResult,
    onResult,
    page,
    port: 1234,
    timeout: 1000,
  })

  expect(onResult.mock.calls.at(0)?.[0]).toMatchObject({
    error: 'navigation failed',
    status: TestState.Fail,
  })
})
