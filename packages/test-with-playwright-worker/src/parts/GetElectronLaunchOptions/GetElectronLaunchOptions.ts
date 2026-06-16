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

export const getElectronLaunchOptions = ({
  args,
  env,
  executablePath,
}: ElectronRuntimeOptions): {
  readonly args: readonly string[]
  readonly env: Record<string, string>
  readonly executablePath: string
} => {
  return {
    args,
    env: {
      ...getProcessEnv(),
      ...env,
    },
    executablePath,
  }
}
