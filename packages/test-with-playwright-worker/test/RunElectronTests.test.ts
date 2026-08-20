import { afterEach, expect, jest, test } from '@jest/globals'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as RunElectronTests from '../src/parts/RunElectronTests/RunElectronTests.ts'

const temporaryDirectories: string[] = []

afterEach(async () => {
  const directories = [...temporaryDirectories]
  temporaryDirectories.length = 0
  await Promise.all(directories.map((directory) => rm(directory, { force: true, recursive: true })))
})

const createTestSrc = async (): Promise<string> => {
  const testSrc = await mkdtemp(join(tmpdir(), 'test-with-playwright-'))
  temporaryDirectories.push(testSrc)
  await writeFile(
    join(testSrc, 'test-A.mjs'),
    `
export const test = async () => {}
`,
  )
  await writeFile(
    join(testSrc, 'test-B.mjs'),
    `
export const skip = 1
export const test = async () => {}
`,
  )
  await writeFile(
    join(testSrc, 'test-C.mjs'),
    `
export const test = async () => {
  throw new Error('test failed')
}
`,
  )
  return testSrc
}

test('runElectronTests filters tests and reports exact results', async () => {
  const onResult = jest.fn(async (_result: any): Promise<void> => {})
  const onFinalResult = jest.fn(async (_result: any): Promise<void> => {})
  const testSrc = await createTestSrc()

  await RunElectronTests.runElectronTests({
    electronApp: {},
    filter: 'A',
    onFinalResult,
    onResult,
    page: {
      locator: () => 'unused',
    } as any,
    tests: ['test-A.mjs', 'test-B.mjs'],
    testSrc,
    timeout: 1000,
  })

  expect(onResult.mock.calls).toHaveLength(1)
  expect(onResult.mock.calls.at(0)?.[0]).toMatchObject({
    error: '',
    name: 'test-A.mjs',
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

test('runElectronTests reports passed, skipped, and failed tests without a filter', async () => {
  const onResult = jest.fn(async (_result: any): Promise<void> => {})
  const onFinalResult = jest.fn(async (_result: any): Promise<void> => {})
  const testSrc = await createTestSrc()

  await RunElectronTests.runElectronTests({
    electronApp: {},
    onFinalResult,
    onResult,
    page: {
      locator: () => 'unused',
    } as any,
    tests: ['test-A.mjs', 'test-B.mjs', 'test-C.mjs'],
    testSrc,
    timeout: 1000,
  })

  expect(onResult.mock.calls).toHaveLength(3)
  expect(onFinalResult.mock.calls.at(0)?.[0]).toMatchObject({
    failed: 1,
    passed: 1,
    skipped: 1,
  })
})

test('runElectronTests forwards SVG screenshot options', async () => {
  const onResult = jest.fn(async (_result: any): Promise<void> => {})
  const onFinalResult = jest.fn(async (_result: any): Promise<void> => {})
  const testSrc = await createTestSrc()

  await RunElectronTests.runElectronTests({
    electronApp: {},
    filter: 'B',
    onFinalResult,
    onResult,
    page: {
      locator: () => 'unused',
    } as any,
    svgScreenshotOptions: {
      directory: '/tmp/screenshots',
      name: 'chromium',
      update: false,
    },
    tests: ['test-A.mjs', 'test-B.mjs'],
    testSrc,
    timeout: 1000,
  })

  expect(onFinalResult.mock.calls.at(0)?.[0]).toMatchObject({
    failed: 0,
    passed: 0,
    skipped: 1,
  })
})
