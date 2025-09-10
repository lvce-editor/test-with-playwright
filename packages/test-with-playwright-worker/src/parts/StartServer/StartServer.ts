/* eslint-disable n/no-unsupported-features/es-syntax */
import { fork } from 'node:child_process'

/**
 *
 * @param {{signal:AbortSignal, port:number, serverPath:string, onlyExtension:string, testPath:string}} param0
 * @returns
 */
export const startServer = async ({ signal, port, serverPath, onlyExtension, testPath }): Promise<any> => {
  const child = fork(serverPath, {
    stdio: 'inherit',
    // signal,
    env: {
      ...process.env,
      PORT: String(port),
      ONLY_EXTENSION: onlyExtension,
      TEST_PATH: testPath,
    },
  })
  child.on('error', (x) => {
    if (x.name === 'AbortError') {
      return
    }
    console.log('child error', x)
  })
  const { resolve, promise } = Promise.withResolvers<void>()
  child.on('message', resolve)
  await promise
  return child
}
