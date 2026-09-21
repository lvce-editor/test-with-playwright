import { fork } from 'node:child_process'

export const getServerArgs = (link: readonly string[] | undefined): string[] => {
  return link?.flatMap((path) => ['--link', path]) || []
}

/**
 *
 * @param {{signal:AbortSignal, port:number, serverPath:string, onlyExtension:string, testPath:string}} param0
 * @returns
 */
export const startServer = async ({
  link,
  onlyExtension,
  port,
  serverPath,
  signal,
  testPath,
}: {
  link?: readonly string[]
  onlyExtension: string
  port: number
  serverPath: string
  signal: AbortSignal
  testPath: string
}): Promise<any> => {
  const child = fork(serverPath, getServerArgs(link), {
    // signal,
    env: {
      ...process.env,
      ONLY_EXTENSION: onlyExtension,
      PORT: String(port),
      TEST_PATH: testPath,
    },
    stdio: 'inherit',
  })
  child.on('error', (x) => {
    if (x.name === 'AbortError') {
      return
    }
    console.log('child error', x)
  })
  const { promise, resolve } = Promise.withResolvers<void>()
  child.on('message', resolve)
  await promise
  return child
}
