import { test, expect, jest } from '@jest/globals'
import * as TestState from '../src/parts/TestState/TestState.ts'

const mockRunElectronTest = jest.fn()

jest.unstable_mockModule('../src/parts/RunElectronTest/RunElectronTest.ts', () => ({
  runElectronTest: mockRunElectronTest,
}))

const RunElectronTests = await import('../src/parts/RunElectronTests/RunElectronTests.ts')

test('runElectronTests filters tests and reports exact results', async () => {
  mockRunElectronTest.mockResolvedValueOnce({ status: TestState.Pass })

  const onResult = jest.fn(async () => {})
  const onFinalResult = jest.fn(async () => {})

  await RunElectronTests.runElectronTests({
    filter: 'A',
    onFinalResult,
    onResult,
    page: {} as any,
    tests: ['test-A.js', 'test-B.js'],
    timeout: 1_000,
  })

  expect(mockRunElectronTest.mock.calls).toEqual([
    [
      {
        page: {},
        test: 'test-A.js',
        timeout: 1_000,
      },
    ],
  ])
  expect(onResult.mock.calls).toHaveLength(1)
  expect(onFinalResult.mock.calls).toHaveLength(1)
  expect(onFinalResult.mock.calls[0]?.[0]).toEqual(
    expect.objectContaining({
      failed: 0,
      passed: 1,
      skipped: 0,
    }),
  )
})