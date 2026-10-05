import { expect, jest, test } from '@jest/globals'
import { runTests, type TestPage } from '../src/parts/RunTests/RunTests.ts'
import * as TestState from '../src/parts/TestState/TestState.ts'

const createTestPage = (state: string): TestPage => {
  let navigated = false
  const overlay = {
    getAttribute: jest.fn(async (): Promise<string> => state),
    textContent: jest.fn(async (): Promise<string> => 'scenario result'),
    waitFor: jest.fn(async (): Promise<void> => {}),
  }
  return {
    dispose: jest.fn(async (): Promise<void> => {}),
    page: {
      goto: jest.fn(async (): Promise<void> => {
        if (navigated) throw new Error('previous renderer is unavailable')
        navigated = true
      }),
      locator: jest.fn(() => overlay),
    } as any,
  }
}

test('isolated pages preserve failures and dispose before the next scenario without retrying', async () => {
  const first = createTestPage('fail')
  const second = createTestPage('pass')
  const third = createTestPage('skip')
  const disposedBeforeNext: boolean[] = []
  const createPage = jest.fn(async (): Promise<TestPage> => {
    if (createPage.mock.calls.length === 1) return first
    disposedBeforeNext.push((first.dispose as any).mock.calls.length === 1)
    if (createPage.mock.calls.length === 3) {
      disposedBeforeNext.push((second.dispose as any).mock.calls.length === 1)
      return third
    }
    return second
  })
  const onResult = jest.fn(async (): Promise<void> => {})
  const onFinalResult = jest.fn(async (): Promise<void> => {})

  await runTests({
    browser: 'webkit',
    createPage,
    headless: true,
    onFinalResult,
    onResult,
    page: first.page,
    port: 1234,
    tests: ['first.js', 'second.js', 'third.js'],
    testSrc: '/tests',
    timeout: 1000,
  })

  expect(disposedBeforeNext).toEqual([true, true, true])
  expect(createPage).toHaveBeenCalledTimes(3)
  expect(first.page.goto).toHaveBeenCalledTimes(1)
  expect(second.page.goto).toHaveBeenCalledTimes(1)
  expect(third.page.goto).toHaveBeenCalledTimes(1)
  expect(first.dispose).toHaveBeenCalledTimes(1)
  expect(second.dispose).toHaveBeenCalledTimes(1)
  expect(third.dispose).toHaveBeenCalledTimes(1)
  expect(onResult.mock.calls).toEqual([
    [expect.objectContaining({ name: 'first.js', status: TestState.Fail })],
    [expect.objectContaining({ name: 'second.js', status: TestState.Pass })],
    [expect.objectContaining({ name: 'third.js', status: TestState.Skip })],
  ])
  expect(onFinalResult).toHaveBeenCalledWith(expect.objectContaining({ failed: 1, passed: 1, skipped: 1 }))
})

test('caller-owned page is preserved when no page factory is provided', async () => {
  const resource = createTestPage('pass')
  const onResult = jest.fn(async (): Promise<void> => {})
  await runTests({
    headless: true,
    onFinalResult: async (): Promise<void> => {},
    onResult,
    page: resource.page,
    port: 1234,
    tests: ['first.js', 'second.js'],
    testSrc: '/tests',
    timeout: 1000,
  })
  expect(resource.page.goto).toHaveBeenCalledTimes(2)
  expect(resource.dispose).not.toHaveBeenCalled()
  expect(onResult.mock.calls).toEqual([
    [expect.objectContaining({ status: TestState.Pass })],
    [expect.objectContaining({ error: 'previous renderer is unavailable', status: TestState.Fail })],
  ])
})

test('isolated page is disposed when reporting fails', async () => {
  const resource = createTestPage('pass')
  const error = new Error('reporter disconnected')
  await expect(
    runTests({
      createPage: async (): Promise<TestPage> => resource,
      headless: true,
      onFinalResult: async (): Promise<void> => {},
      onResult: async (): Promise<void> => {
        throw error
      },
      page: resource.page,
      port: 1234,
      tests: ['first.js'],
      testSrc: '/tests',
      timeout: 1000,
    }),
  ).rejects.toBe(error)
  expect(resource.dispose).toHaveBeenCalledTimes(1)
})
