import { join } from 'node:path'

interface ElectronRuntimeOptions {
  readonly args: readonly string[]
  readonly env: Record<string, string>
  readonly executablePath: string
  readonly type: 'electron'
}

const getProcessEnv = (): Record<string, string> => {
  const env: Record<string, string> = Object.create(null)
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      env[key] = value
    }
  }
  return env
}

export const getElectronLaunchOptions = (
  { args, env, executablePath }: ElectronRuntimeOptions,
  profileRoot: string,
): {
  readonly args: readonly string[]
  readonly env: Record<string, string>
  readonly executablePath: string
} => {
  const launchEnv: Record<string, string> = {
    ...getProcessEnv(),
    ...env,
    XDG_CACHE_HOME: join(profileRoot, 'cache'),
    XDG_CONFIG_HOME: join(profileRoot, 'config'),
    XDG_DATA_HOME: join(profileRoot, 'data'),
    XDG_STATE_HOME: join(profileRoot, 'state'),
  }
  delete launchEnv['ELECTRON_RUN_AS_NODE']
  return {
    args,
    env: launchEnv,
    executablePath,
  }
}
