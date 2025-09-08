import * as Signal from '../Signal/Signal.ts'

export const tearDownTests = ({ controller, child }): void => {
  controller.abort()
  child.kill(Signal.SIGINT)
}
