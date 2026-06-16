import { expect, type Page } from '@playwright/test'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as TestState from '../TestState/TestState.ts'

interface ElectronTestModule {
  readonly skip?: number
  readonly test: (context: {
    readonly Locator: (selector: string) => ReturnType<Page['locator']>
    readonly electronApp: any
    readonly expect: typeof expect
    readonly page: Page
  }) => Promise<void>
}

const importTestModule = async (testSrc: string, test: string): Promise<ElectronTestModule> => {
  const testPath = join(testSrc, test)
  const testModule = await import(pathToFileURL(testPath).toString())
  return testModule as ElectronTestModule
}

const withTimeout = async <T>(promise: Promise<T>, timeout: number): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Electron test timed out after ${timeout}ms`))
    }, timeout)
    void (async (): Promise<void> => {
      try {
        const value = await promise
        resolve(value)
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)))
      } finally {
        clearTimeout(timer)
      }
    })()
  })
}

export const runElectronTest = async ({
  electronApp,
  page,
  test,
  testSrc,
  timeout,
}: {
  readonly electronApp: any
  readonly page: Page
  readonly test: string
  readonly testSrc: string
  readonly timeout: number
}): Promise<any> => {
  const start = performance.now()
  try {
    const testModule = await importTestModule(testSrc, test)
    if (testModule.skip) {
      const end = performance.now()
      return {
        end,
        error: '',
        name: test,
        start,
        status: TestState.Skip,
      }
    }
    await withTimeout(
      testModule.test({
        electronApp,
        expect,
        Locator: page.locator.bind(page),
        page,
      }),
      timeout,
    )
    const end = performance.now()
    return {
      end,
      error: '',
      name: test,
      start,
      status: TestState.Pass,
    }
  } catch (error) {
    const end = performance.now()
    const message = error instanceof Error ? error.message : String(error)
    return {
      end,
      error: message,
      name: test,
      start,
      status: TestState.Fail,
    }
  }
}
