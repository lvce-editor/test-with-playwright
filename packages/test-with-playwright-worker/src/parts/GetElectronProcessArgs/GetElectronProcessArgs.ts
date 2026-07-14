export const getElectronProcessArgs = ({
  args,
  platform = process.platform,
  userDataDir,
}: {
  readonly args: readonly string[]
  readonly platform?: string
  readonly userDataDir: string
}): readonly string[] => {
  return [
    '--remote-debugging-port=0',
    ...(platform === 'linux' ? ['--no-sandbox'] : []),
    ...args,
    `--user-data-dir=${userDataDir}`,
  ]
}
