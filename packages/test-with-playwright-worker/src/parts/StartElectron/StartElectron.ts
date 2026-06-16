import { chromium } from '@playwright/test'
import { spawn, type ChildProcess } from 'node:child_process'
import { createInterface } from 'node:readline'
import * as GetElectronLaunchOptions from '../GetElectronLaunchOptions/GetElectronLaunchOptions.ts'
import * as Signal from '../Signal/Signal.ts'

interface ElectronRuntimeOptions {
  readonly args: readonly string[]
  readonly env: Record<string, string>
  readonly executablePath: string
  readonly type: 'electron'
}

const devtoolsRegex = /^DevTools listening on (ws:\/\/.*)$/

const waitForDevtoolsEndpoint = async (child: ChildProcess): Promise<string> => {
  const stderr = child.stderr
  if (!stderr) {
    throw new Error('Electron stderr is unavailable')
  }
  const lines = createInterface({ input: stderr })
  const { promise, reject, resolve } = Promise.withResolvers<string>()
  const onExit = (): void => {
    reject(new Error('Electron exited before DevTools endpoint was available'))
  }
  const onLine = (line: string): void => {
    const match = line.match(devtoolsRegex)
    if (match) {
      resolve(match[1])
    }
  }
  child.once('exit', onExit)
  lines.on('line', onLine)
  try {
    return await promise
  } finally {
    child.off('exit', onExit)
    lines.off('line', onLine)
    lines.close()
  }
}

const getFirstPage = async (browser: any): Promise<any> => {
  const context = browser.contexts()[0]
  const pages = context.pages()
  if (pages.length > 0) {
    return pages[0]
  }
  return context.waitForEvent('page', { timeout: 15_000 })
}

const closeElectron = async ({ browser, child }: { readonly browser: any; readonly child: ChildProcess }): Promise<void> => {
  await browser.close().catch(() => undefined)
  if (!child.killed) {
    child.kill(Signal.SIGINT as NodeJS.Signals)
  }
}

export const startElectron = async ({
  runtimeOptions,
  signal,
}: {
  readonly runtimeOptions: ElectronRuntimeOptions
  readonly signal: AbortSignal
}): Promise<{ electronApp: any; page: any }> => {
  const launchOptions = GetElectronLaunchOptions.getElectronLaunchOptions(runtimeOptions)
  const child = spawn(launchOptions.executablePath, ['--remote-debugging-port=0', ...launchOptions.args], {
    env: launchOptions.env,
    stdio: ['ignore', 'ignore', 'pipe'],
  })
  let browser: any
  try {
    const endpoint = await waitForDevtoolsEndpoint(child)
    browser = await chromium.connectOverCDP(endpoint)
    const page = await getFirstPage(browser)
    const electronApp = {
      close: async (): Promise<void> => {
        await closeElectron({ browser, child })
      },
      process: (): ChildProcess => {
        return child
      },
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    signal.addEventListener('abort', async () => {
      await electronApp.close()
    })
    return {
      electronApp,
      page,
    }
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => undefined)
    }
    if (!child.killed) {
      child.kill(Signal.SIGINT as NodeJS.Signals)
    }
    throw error
  }
}
