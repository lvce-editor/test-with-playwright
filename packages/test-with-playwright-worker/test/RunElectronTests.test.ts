import { expect, jest, test } from '@jest/globals'

const runElectronTest = jest.fn(async ({ test }: { readonly test: string }): Promise<any> => {
  if (test.includes('skipped')) {
    return {
      error: '',
      name: test,
      status: 2,
    }
  }
  return {
    error: '',
    name: test,
    status: 1,
  }
})

jest.unstable_mockModule('../src/parts/RunElectronTest/RunElectronTest.ts', () => {
  return {
    runElectronTest,
  }
})

const RunElectronTests = await import('../src/parts/RunElectronTests/RunElectronTests.ts')

test('runElectronTests filters tests and reports exact results', async () => {
  const onResult = jest.fn(async (_result: any): Promise<void> => {})
  const onFinalResult = jest.fn(async (_result: any): Promise<void> => {})

  await RunElectronTests.runElectronTests({
    electronApp: {},
    filter: 'typed',
    onFinalResult,
    onResult,
    page: {
      locator: () => 'unused',
    } as any,
    port: 3002,
    tests: ['electron.typed-smoke.ts', 'electron.open-folder-dialog.ts'],
    testSrc: '/workspace/e2e/src',
    timeout: 1000,
  })

  expect(runElectronTest).toHaveBeenCalledTimes(1)
  expect(runElectronTest).toHaveBeenCalledWith({
    page: expect.any(Object),
    port: 3002,
    test: 'electron.typed-smoke.ts',
    timeout: 1000,
  })
  expect(onResult.mock.calls).toHaveLength(1)
  expect(onResult.mock.calls.at(0)?.[0]).toMatchObject({
    error: '',
    name: 'electron.typed-smoke.ts',
    status: 1,
  })
  expect(onFinalResult.mock.calls).toHaveLength(1)
  const finalResult = onFinalResult.mock.calls.at(0)?.[0]
  expect(finalResult).toMatchObject({
    failed: 0,
    passed: 1,
    skipped: 0,
  })
})
