import { afterEach, expect, test } from '@jest/globals'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as RunElectronTest from '../src/parts/RunElectronTest/RunElectronTest.ts'
import * as TestState from '../src/parts/TestState/TestState.ts'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })))
})

const writeTestModule = async (source: string): Promise<{ test: string; testSrc: string }> => {
  const testSrc = await mkdtemp(join(tmpdir(), 'test-with-playwright-'))
  temporaryDirectories.push(testSrc)
  const test = 'sample.test.mjs'
  await writeFile(join(testSrc, test), source)
  return { test, testSrc }
}

test('runElectronTest executes test module with electron context', async () => {
  const { test: testFile, testSrc } = await writeTestModule(`
export const test = async ({ Locator, electronApp }) => {
  const value = Locator('.SideBar')
  if (value !== 'locator:.SideBar') {
    throw new Error('unexpected locator')
  }
  if (electronApp.name !== 'app') {
    throw new Error('unexpected electron app')
  }
}
`)

  const page = {
    locator: (selector: string): string => `locator:${selector}`,
  }

  const result = await RunElectronTest.runElectronTest({
    electronApp: { name: 'app' },
    page: page as any,
    test: testFile,
    testSrc,
    timeout: 1000,
  })

  expect(result.status).toBe(TestState.Pass)
  expect(result.error).toBe('')
  expect(result.name).toBe(testFile)
})

test('runElectronTest marks skipped modules as skipped', async () => {
  const { test: testFile, testSrc } = await writeTestModule(`
export const skip = 1
export const test = async () => {}
`)

  const result = await RunElectronTest.runElectronTest({
    electronApp: {},
    page: {
      locator: () => 'unused',
    } as any,
    test: testFile,
    testSrc,
    timeout: 1000,
  })

  expect(result.status).toBe(TestState.Skip)
  expect(result.error).toBe('')
})
