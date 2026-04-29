interface GetRuntimeOptionsOptions {
  readonly cwd: string
  readonly electronArgs?: readonly string[]
  readonly electronCwd?: string
  readonly electronEntry?: string
  readonly electronEnv?: readonly string[]
  readonly electronPath?: string
  readonly runtime?: string
  readonly serverPath?: string
}

interface BrowserRuntimeOptions {
  readonly serverPath?: string
  readonly type: 'browser'
}

interface ElectronRuntimeOptions {
  readonly args: readonly string[]
  readonly cwd: string
  readonly entry: string
  readonly env: Record<string, string>
  readonly executablePath?: string
  readonly type: 'electron'
}

const getOptionalStringProperty = <T extends string>(
  key: T,
  value: string | undefined,
): { readonly [K in T]?: string } => {
  if (value === undefined) {
    return {}
  }
  return {
    [key]: value,
  } as { readonly [K in T]?: string }
}

const parseElectronEnv = (electronEnv: readonly string[] | undefined): Record<string, string> => {
  if (!electronEnv) {
    return Object.create(null)
  }
  const env: Record<string, string> = Object.create(null)
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

export const getRuntimeOptions = ({
  cwd,
  electronArgs,
  electronCwd,
  electronEntry,
  electronEnv,
  electronPath,
  runtime,
  serverPath,
}: GetRuntimeOptionsOptions): BrowserRuntimeOptions | ElectronRuntimeOptions => {
  if (runtime === 'electron') {
    return {
      args: electronArgs || [],
      cwd: electronCwd || cwd,
      entry: electronEntry || '.',
      env: parseElectronEnv(electronEnv),
      ...getOptionalStringProperty('executablePath', electronPath),
      type: 'electron',
    }
  }
  return {
    ...getOptionalStringProperty('serverPath', serverPath),
    type: 'browser',
  }
}
