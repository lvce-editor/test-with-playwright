import { chromium } from '@playwright/test'
import { spawn, type ChildProcess } from 'node:child_process'
import { createInterface } from 'node:readline'
import * as GetElectronLaunchOptions from '../GetElectronLaunchOptions/GetElectronLaunchOptions.ts'
import * as Signal from '../Signal/Signal.ts'

const { asyncDispose }: { readonly asyncDispose: typeof Symbol.asyncDispose } = Symbol

interface ElectronRuntimeOptions {
  readonly args: readonly string[]
  readonly env: Record<string, string>
  readonly executablePath: string
  readonly type: 'electron'
}

interface ElectronApp extends AsyncDisposable {
  readonly close: () => Promise<void>
  readonly process: () => ChildProcess
}

export interface ElectronLaunch extends AsyncDisposable {
  readonly electronApp: ElectronApp
  readonly page: any
}

const devtoolsRegex = /^DevTools listening on (ws:\/\/.*)$/

const waitForDevtoolsEndpoint = async (child: ChildProcess): Promise<string> => {
  const { stderr } = child
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

const closeElectron = async ({
  browser,
  child,
}: {
  readonly browser: any
  readonly child: ChildProcess
}): Promise<void> => {
  try {
    await browser.close()
  } catch {
    // ignore close errors during cleanup
  }
  if (!child.killed) {
    child.kill(Signal.SIGINT as NodeJS.Signals)
  }
}

const createElectronLaunch = ({
  browser,
  child,
  page,
  signal,
}: {
  readonly browser: any
  readonly child: ChildProcess
  readonly page: any
  readonly signal: AbortSignal
}): ElectronLaunch => {
  let disposed = false
  const dispose = async (): Promise<void> => {
    if (disposed) {
      return
    }
    disposed = true
    signal.removeEventListener('abort', handleAbort)
    process.off('SIGINT', handleSigint)
    process.off('SIGTERM', handleSigterm)
    await closeElectron({ browser, child })
  }
  const handleAbort = (): void => {
    void dispose()
  }
  const handleProcessSignal = (processSignal: NodeJS.Signals): void => {
    void (async (): Promise<void> => {
      try {
        await dispose()
      } finally {
        process.kill(process.pid, processSignal)
      }
    })()
  }
  const handleSigint = (): void => {
    handleProcessSignal('SIGINT')
  }
  const handleSigterm = (): void => {
    handleProcessSignal('SIGTERM')
  }
  signal.addEventListener('abort', handleAbort)
  process.once('SIGINT', handleSigint)
  process.once('SIGTERM', handleSigterm)
  const electronApp: ElectronApp = {
    [asyncDispose]: dispose,
    close: dispose,
    process: (): ChildProcess => {
      return child
    },
  }
  return {
    [asyncDispose]: dispose,
    electronApp,
    page,
  }
}

export const startElectron = async ({
  runtimeOptions,
  signal,
}: {
  readonly runtimeOptions: ElectronRuntimeOptions
  readonly signal: AbortSignal
}): Promise<ElectronLaunch> => {
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
    return createElectronLaunch({ browser, child, page, signal })
  } catch (error) {
    if (browser) {
      try {
        await browser.close()
      } catch {
        // ignore close errors during cleanup
      }
    }
    if (!child.killed) {
      child.kill(Signal.SIGINT as NodeJS.Signals)
    }
    throw error
  }
}
