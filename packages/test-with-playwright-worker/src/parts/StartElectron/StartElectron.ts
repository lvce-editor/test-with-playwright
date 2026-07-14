import type { ChildProcess } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as GetElectronLaunchOptions from '../GetElectronLaunchOptions/GetElectronLaunchOptions.ts'
import * as GetElectronProcessArgs from '../GetElectronProcessArgs/GetElectronProcessArgs.ts'

const electronLaunchTimeout = 120_000

interface ElectronRuntimeOptions {
  readonly args: readonly string[]
  readonly env: Record<string, string>
  readonly executablePath: string
  readonly type: 'electron'
}

interface ElectronApp {
  readonly close: () => Promise<void>
  readonly firstWindow: (options: { readonly timeout: number }) => Promise<any>
  readonly process: () => ChildProcess
}

export interface ElectronLaunch extends AsyncDisposable {
  readonly electronApp: ElectronApp
  readonly page: any
}

const closeElectron = async ({
  electronApp,
  userDataDir,
}: {
  readonly electronApp: ElectronApp
  readonly userDataDir: string
}): Promise<void> => {
  try {
    await electronApp.close()
  } catch {
    // ignore close errors during cleanup
  }
  await rm(userDataDir, { force: true, recursive: true })
}

const createElectronLaunch = ({
  electronApp,
  page,
  signal,
  userDataDir,
}: {
  readonly electronApp: ElectronApp
  readonly page: any
  readonly signal: AbortSignal
  readonly userDataDir: string
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
    await closeElectron({ electronApp, userDataDir })
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
  return {
    electronApp,
    page,
    [Symbol.asyncDispose]: dispose,
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
  const userDataDir = await mkdtemp(join(tmpdir(), 'test-with-playwright-electron-'))
  const args = GetElectronProcessArgs.getElectronProcessArgs({ args: launchOptions.args, userDataDir })
  let electronApp: ElectronApp | undefined
  try {
    const { _electron } = await import('@playwright/test')
    electronApp = await _electron.launch({
      args: [...args],
      env: launchOptions.env,
      executablePath: launchOptions.executablePath,
      timeout: electronLaunchTimeout,
    })
    const page = await electronApp.firstWindow({ timeout: electronLaunchTimeout })
    return createElectronLaunch({ electronApp, page, signal, userDataDir })
  } catch (error) {
    if (electronApp) {
      await closeElectron({ electronApp, userDataDir })
    } else {
      await rm(userDataDir, { force: true, recursive: true })
    }
    throw error
  }
}
