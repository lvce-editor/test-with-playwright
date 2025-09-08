import * as TestOverlayState from '../TestOverlayState/TestOverlayState.ts'
import * as TestState from '../TestState/TestState.ts'

export const getTestState = (testOverlayState, text): void => {
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
