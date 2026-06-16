import { afterEach, expect, jest, test } from '@jest/globals'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as RunElectronTests from '../src/parts/RunElectronTests/RunElectronTests.ts'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })))
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
