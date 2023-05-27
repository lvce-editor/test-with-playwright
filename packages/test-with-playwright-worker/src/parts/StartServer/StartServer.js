import { fork } from 'child_process'

/**
 *
 * @param {{signal:AbortSignal, port:number, serverPath:string}} param0
 * @returns
 */
export const startServer = async ({ signal, port, serverPath }) => {
  const child = fork(serverPath, {
    stdio: 'inherit',
    // signal,
    env: {
      ...process.env,
      PORT: String(port),
    },
  })
  child.on('error', (x) => {
    if (x.name === 'AbortError') {
      return
    }
    console.log('child error', x)
  })
  await new Promise((resolve) => {
    child.on('message', resolve)
  })
  return child
}
