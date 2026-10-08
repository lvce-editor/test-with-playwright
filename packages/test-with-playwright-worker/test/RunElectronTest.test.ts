import { afterEach, expect, test } from '@jest/globals'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as RunElectronTest from '../src/parts/RunElectronTest/RunElectronTest.ts'
import * as TestState from '../src/parts/TestState/TestState.ts'

const temporaryDirectories: string[] = []

afterEach(async () => {
  const directories = [...temporaryDirectories]
  temporaryDirectories.length = 0
  await Promise.all(directories.map((directory) => rm(directory, { force: true, recursive: true })))
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

test('runElectronTest fails on console errors and uncaught page errors', async () => {
  const { test: testFile, testSrc } = await writeTestModule(`
export const test = async () => {}
`)
  const listeners = new Map<string, Set<(value: any) => void>>()
  const page = {
    locator: (): string => 'unused',
    off: (event: string, listener: (value: any) => void): void => {
      listeners.get(event)?.delete(listener)
    },
    on: (event: string, listener: (value: any) => void): void => {
      let eventListeners = listeners.get(event)
      if (!eventListeners) {
        eventListeners = new Set()
        listeners.set(event, eventListeners)
      }
      eventListeners.add(listener)
      if (event === 'console') {
        listener({
          location: () => ({ columnNumber: 0, lineNumber: 0, url: '' }),
          text: () => 'electron console error',
          type: () => 'error',
        })
      } else {
        listener(new Error('electron page error'))
      }
    },
  }

  const result = await RunElectronTest.runElectronTest({
    electronApp: {},
    failOnConsoleMessages: true,
    page: page as any,
    test: testFile,
    testSrc,
    timeout: 1000,
  })

  expect(result).toMatchObject({
    error: expect.stringContaining('console error: electron console error'),
    status: TestState.Fail,
  })
  expect(result.error).toContain('uncaught page error: Error: electron page error')
  expect(listeners.get('console')?.size).toBe(0)
  expect(listeners.get('pageerror')?.size).toBe(0)
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

test('runElectronTest reports SVG screenshot capture errors after a passing test', async () => {
  const { test: testFile, testSrc } = await writeTestModule(`
export const test = async () => {}
`)
  const page = {
    locator: (): string => 'unused',
  }
  const svgScreenshotOptions = {
    directory: '/tmp/screenshots',
    name: 'chromium',
    update: false,
  }

  const result = await RunElectronTest.runElectronTest({
    electronApp: {},
    page: page as any,
    svgScreenshotOptions,
    test: testFile,
    testSrc,
    timeout: 1000,
  })

  expect(result).toMatchObject({
    error: expect.stringContaining('Failed to capture SVG screenshot'),
    status: TestState.Fail,
  })
})

test('runElectronTest reports errors thrown by a test module', async () => {
  const { test: testFile, testSrc } = await writeTestModule(`
export const test = async () => {
  throw new Error('test failed')
}
`)

  const result = await RunElectronTest.runElectronTest({
    electronApp: {},
    page: { locator: (): string => 'unused' } as any,
    test: testFile,
    testSrc,
    timeout: 1000,
  })

  expect(result).toMatchObject({
    error: 'test failed',
    status: TestState.Fail,
  })
})

test('runElectronTest converts non-error test failures to errors', async () => {
  const { test: testFile, testSrc } = await writeTestModule(`
export const test = async () => {
  throw 'test failed'
}
`)

  const result = await RunElectronTest.runElectronTest({
    electronApp: {},
    page: { locator: (): string => 'unused' } as any,
    test: testFile,
    testSrc,
    timeout: 1000,
  })

  expect(result).toMatchObject({
    error: 'test failed',
    status: TestState.Fail,
  })
})

test('runElectronTest reports a timeout', async () => {
  const { test: testFile, testSrc } = await writeTestModule(`
export const test = async () => new Promise(() => {})
`)

  const result = await RunElectronTest.runElectronTest({
    electronApp: {},
    page: { locator: (): string => 'unused' } as any,
    test: testFile,
    testSrc,
    timeout: 1,
  })

  expect(result).toMatchObject({
    error: 'Electron test timed out after 1ms',
    status: TestState.Fail,
  })
})
