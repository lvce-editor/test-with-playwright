import { afterEach, test, expect, jest } from '@jest/globals'
import * as RunElectronTest from '../src/parts/RunElectronTest/RunElectronTest.ts'
import * as RunElectronTests from '../src/parts/RunElectronTests/RunElectronTests.ts'
import * as TestState from '../src/parts/TestState/TestState.ts'

afterEach(() => {
  jest.restoreAllMocks()
})

test('runElectronTests filters tests and reports exact results', async () => {
  const runElectronTestSpy = jest.spyOn(RunElectronTest, 'runElectronTest').mockResolvedValueOnce({
    end: 1,
    error: '',
    name: 'test-A.js',
    start: 0,
    status: TestState.Pass,
  })

  const onResult = jest.fn(async (_result: any): Promise<void> => {})
  const onFinalResult = jest.fn(async (_result: any): Promise<void> => {})

  await RunElectronTests.runElectronTests({
    filter: 'A',
    onFinalResult,
    onResult,
    page: {} as any,
    tests: ['test-A.js', 'test-B.js'],
    timeout: 1000,
  })

  expect(runElectronTestSpy.mock.calls).toEqual([
    [
      {
        page: {},
        test: 'test-A.js',
        timeout: 1000,
      },
    ],
  ])
  expect(onResult.mock.calls).toHaveLength(1)
  expect(onFinalResult.mock.calls).toHaveLength(1)
  const finalResult = onFinalResult.mock.calls.at(0)?.[0]
  expect(finalResult).toMatchObject({
    failed: 0,
    passed: 1,
    skipped: 0,
  })
})
