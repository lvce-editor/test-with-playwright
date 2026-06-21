import { expect, jest, test } from '@jest/globals'
import * as RunTestsWithReusedPage from '../src/parts/RunTestsWithReusedPage/RunTestsWithReusedPage.ts'
import * as TestState from '../src/parts/TestState/TestState.ts'

const createPage = (text: string): any => {
  const testResults = {
    textContent: jest.fn(async (): Promise<string> => text),
    waitFor: jest.fn(async (): Promise<void> => {}),
  }
  return {
    goto: jest.fn(async (): Promise<void> => {}),
    locator: jest.fn(() => testResults),
    waitForFunction: jest.fn(async (): Promise<void> => {}),
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
