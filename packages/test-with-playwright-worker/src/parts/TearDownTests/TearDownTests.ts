import * as Signal from '../Signal/Signal.ts'

export const tearDownTests = ({ controller, child }: Readonly<{ controller: AbortController; child: any }>): void => {
  controller.abort()
  child.kill(Signal.SIGINT)
}
