import * as Signal from '../Signal/Signal.js'

export const tearDownTests = ({ controller, child }) => {
  controller.abort()
  child.kill(Signal.SIGINT)
}
