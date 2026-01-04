import { fork } from 'node:child_process'

/**
 *
 * @param {{signal:AbortSignal, port:number, serverPath:string, onlyExtension:string, testPath:string}} param0
 * @returns
 */
export const startServer = async ({ onlyExtension, port, serverPath, signal, testPath }): Promise<any> => {
  const child = fork(serverPath, {
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
