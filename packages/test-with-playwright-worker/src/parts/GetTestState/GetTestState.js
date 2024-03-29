import * as TestOverlayState from '../TestOverlayState/TestOverlayState.js'
import * as TestState from '../TestState/TestState.js'

export const getTestState = (testOverlayState, text) => {
  switch (testOverlayState) {
    case TestOverlayState.Pass:
      return {
        status: TestState.Pass,
        error: '',
      }
    case TestOverlayState.Skip:
      return {
        status: TestState.Skip,
        error: '',
      }
    case TestOverlayState.Fail:
      return {
        status: TestState.Fail,
        error: `${text}`,
      }
    default:
      throw new Error(`unexpected test state: ${testOverlayState}`)
  }
}
