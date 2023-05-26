import { fork } from 'child_process'

/**
 *
 * @param {{signal:AbortSignal, port:number}} param0
 * @returns
 */
export const startServer = async ({ signal, port }) => {
  const { serverPath } = await import('@lvce-editor/server')
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
  await new Promise((r) => {
    child.on('message', r)
  })
  return child
}
