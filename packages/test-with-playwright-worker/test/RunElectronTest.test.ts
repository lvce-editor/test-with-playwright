import { expect, jest, test } from '@jest/globals'

const runTest = jest.fn(async (): Promise<any> => {
  return {
    error: '',
    name: 'electron.typed-smoke.ts',
    status: 1,
  }
})

jest.unstable_mockModule('../src/parts/RunTest/RunTest.ts', () => {
  return {
    runTest,
  }
})

const RunElectronTest = await import('../src/parts/RunElectronTest/RunElectronTest.ts')

test('runElectronTest delegates to overlay test runner on electron app port', async () => {
  const page = {}

  const result = await RunElectronTest.runElectronTest({
    page: page as any,
    test: 'electron.typed-smoke.ts',
    timeout: 1000,
  })

  expect(result).toEqual({
    error: '',
    name: 'electron.typed-smoke.ts',
    status: 1,
  })
  expect(runTest).toHaveBeenCalledWith({
    origin: 'lvce://-',
    page,
    port: 0,
    test: 'electron.typed-smoke.ts',
    timeout: 1000,
  })
})
