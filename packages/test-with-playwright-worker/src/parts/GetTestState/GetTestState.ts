import * as TestOverlayState from '../TestOverlayState/TestOverlayState.ts'
import * as TestState from '../TestState/TestState.ts'

export const getTestState = (testOverlayState, text): void => {
  switch (testOverlayState) {
    case TestOverlayState.Fail:
      // @ts-ignore
      return {
        error: `${text}`,
        status: TestState.Fail,
      }
    case TestOverlayState.Pass:
      // @ts-ignore
      return {
        error: '',
        status: TestState.Pass,
      }
    case TestOverlayState.Skip:
      // @ts-ignore
      return {
        error: '',
        status: TestState.Skip,
      }
    default:
      throw new Error(`unexpected test state: ${testOverlayState}`)
  }
}
