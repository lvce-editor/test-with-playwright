import * as Signal from '../Signal/Signal.ts'

export const tearDownTests = ({ controller, child }: {
  readonly controller: AbortController
  readonly child: any
}): void => {
  controller.abort()
  child.kill(Signal.SIGINT)
}
