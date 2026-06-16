import { resolve } from 'node:path'
import * as PrepareElectronApp from '../PrepareElectronApp/PrepareElectronApp.ts'

interface GetRuntimeOptionsOptions {
  readonly cwd: string
  readonly electronArgs?: readonly string[]
  readonly electronCacheDir?: string
  readonly electronEnv?: readonly string[]
  readonly electronPath?: string
  readonly electronVersion?: string
  readonly runtime?: string
  readonly serverPath?: string
}

interface BrowserRuntimeOptions {
  readonly serverPath?: string
  readonly type: 'browser'
}

interface ElectronRuntimeOptions {
  readonly args: readonly string[]
  readonly env: Record<string, string>
  readonly executablePath: string
  readonly type: 'electron'
}

const parseElectronEnv = (electronEnv: readonly string[] | undefined): Record<string, string> => {
  const env: Record<string, string> = Object.create(null)
  if (!electronEnv) {
    return env
  }
  for (const item of electronEnv) {
    const index = item.indexOf('=')
    if (index === -1) {
      env[item] = ''
      continue
    }
    const key = item.slice(0, index)
    const value = item.slice(index + 1)
    env[key] = value
  }
  return env
}

const getBrowserRuntimeOptions = (serverPath: string | undefined): BrowserRuntimeOptions => {
  if (serverPath) {
    return {
      serverPath,
      type: 'browser',
    }
  }
  return {
    type: 'browser',
  }
}

export const getRuntimeOptions = async ({
  cwd,
  electronArgs,
  electronCacheDir,
  electronEnv,
  electronPath,
  electronVersion,
  runtime,
  serverPath,
}: GetRuntimeOptionsOptions): Promise<BrowserRuntimeOptions | ElectronRuntimeOptions> => {
  if (runtime !== undefined && runtime !== 'browser' && runtime !== 'electron') {
    throw new Error(`[test-with-playwright] unsupported runtime: ${runtime}`)
  }
  if (runtime !== 'electron') {
    return getBrowserRuntimeOptions(serverPath)
  }
  const cacheDir = resolve(cwd, electronCacheDir || '.test-with-playwright/electron')
  const executablePath = await PrepareElectronApp.prepareElectronApp({
    cacheDir,
    ...(electronPath && { electronPath: resolve(cwd, electronPath) }),
    ...(electronVersion && { version: electronVersion }),
  })
  return {
    args: electronArgs || [],
    env: parseElectronEnv(electronEnv),
    executablePath,
    type: 'electron',
  }
}
