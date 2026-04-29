import { expect, type Page } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import * as TestState from '../TestState/TestState.ts'

interface ElectronTestModule {
  readonly skip?: number
  readonly test: (context: { Locator: (selector: string) => any; expect: typeof expect; page: Page }) => Promise<void>
}

const importTestModule = async (test: string): Promise<ElectronTestModule> => {
  return import(pathToFileURL(test).toString()) as Promise<ElectronTestModule>
}

const withTimeout = async <T>(promise: Promise<T>, timeout: number): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Electron test timed out after ${timeout}ms`))
    }, timeout)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

export const runElectronTest = async ({
  page,
  test,
  timeout,
}: {
  readonly page: Page
  readonly test: string
  readonly timeout: number
}): Promise<any> => {
  const start = performance.now()
  try {
    const testModule = await importTestModule(test)
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
        Locator: page.locator.bind(page),
        expect,
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
    const message = error instanceof Error ? error.message : `${error}`
    return {
      end,
      error: message,
      name: test,
      start,
      status: TestState.Fail,
    }
  }
}