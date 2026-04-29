interface ElectronRuntimeOptions {
  readonly args: readonly string[]
  readonly cwd: string
  readonly entry: string
  readonly env: Record<string, string>
  readonly executablePath?: string
  readonly type: 'electron'
}

export const getElectronLaunchOptions = ({
  args,
  cwd,
  entry,
  env,
  executablePath,
}: ElectronRuntimeOptions): {
  args: string[]
  readonly cwd: string
  readonly env: Record<string, string>
  readonly executablePath?: string
} => {
  return {
    args: [entry, ...args],
    cwd,
    env,
    ...(executablePath ? { executablePath } : {}),
  }
}
