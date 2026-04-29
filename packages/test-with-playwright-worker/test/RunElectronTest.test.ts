import { afterEach, test, expect } from '@jest/globals'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as RunElectronTest from '../src/parts/RunElectronTest/RunElectronTest.ts'
import * as TestState from '../src/parts/TestState/TestState.ts'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })))
})

const writeTestModule = async (source: string): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), 'test-with-playwright-'))
  temporaryDirectories.push(directory)
  const filePath = join(directory, 'sample.test.mjs')
  await writeFile(filePath, source)
  return filePath
}

test('runElectronTest executes test module with locator context', async () => {
  const testPath = await writeTestModule(`
export const test = async ({ Locator }) => {
  const value = Locator('.SideBar')
  if (value !== 'locator:.SideBar') {
    throw new Error('unexpected locator')
  }
}
`)

  const page = {
    locator: (selector: string): string => `locator:${selector}`,
  }

  const result = await RunElectronTest.runElectronTest({
    page: page as any,
    test: testPath,
    timeout: 1000,
  })

  expect(result.status).toBe(TestState.Pass)
  expect(result.error).toBe('')
  expect(result.name).toBe(testPath)
})

test('runElectronTest marks skipped modules as skipped', async () => {
  const testPath = await writeTestModule(`
export const skip = 1
export const test = async () => {}
`)

  const result = await RunElectronTest.runElectronTest({
    page: {
      locator: () => 'unused',
    } as any,
    test: testPath,
    timeout: 1000,
  })

  expect(result.status).toBe(TestState.Skip)
  expect(result.error).toBe('')
})
