import * as Signal from '../Signal/Signal.ts'

export const tearDownTests = async ({
  controller,
  child,
}: {
  readonly controller: AbortController
  readonly child: any
}): Promise<void> => {
  controller.abort()
  child.kill(Signal.SIGINT)
}
