import * as TestState from '../TestState/TestState.js'

export const closeAll = async () => {
  if (TestState.state.childProcess) {
    TestState.state.childProcess.kill('SIGTERM')
    TestState.state.childProcess = undefined
  }
  if (TestState.state.page) {
    await TestState.state.page.close()
    TestState.state.page = undefined
  }
  if (TestState.state.browser) {
    await TestState.state.browser.close()
    TestState.state.browser = undefined
  }
}
