import * as Signal from '../Signal/Signal.ts'

export const tearDownTests = async ({
  child,
  controller,
  kill,
}: {
  readonly controller: AbortController
  readonly child?: any
  readonly kill?: () => Promise<void>
}): Promise<void> => {
  controller.abort()
  if (kill) {
    await kill()
    return
  }
  if (child) {
    child.kill(Signal.SIGINT)
  }
}
