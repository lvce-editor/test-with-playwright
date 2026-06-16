import { _electron as electron } from '@playwright/test'
import * as GetElectronLaunchOptions from '../GetElectronLaunchOptions/GetElectronLaunchOptions.ts'

interface ElectronRuntimeOptions {
  readonly args: readonly string[]
  readonly env: Record<string, string>
  readonly executablePath: string
  readonly type: 'electron'
}

export const startElectron = async ({
  runtimeOptions,
  signal,
}: {
  readonly runtimeOptions: ElectronRuntimeOptions
  readonly signal: AbortSignal
}): Promise<{ electronApp: any; page: any }> => {
  const launchOptions = GetElectronLaunchOptions.getElectronLaunchOptions(runtimeOptions)
  const electronApp = await electron.launch({
    args: [...launchOptions.args],
    env: launchOptions.env,
    executablePath: launchOptions.executablePath,
  })
  const page = await electronApp.firstWindow()
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  signal.addEventListener('abort', async () => {
    await electronApp.close()
  })
  return {
    electronApp,
    page,
  }
}
