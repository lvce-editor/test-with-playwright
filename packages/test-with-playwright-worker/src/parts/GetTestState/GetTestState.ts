import * as TestOverlayState from '../TestOverlayState/TestOverlayState.ts'
import * as TestState from '../TestState/TestState.ts'

interface TestStateResult {
  readonly error: string
  readonly status: number
}

export const getTestState = (testOverlayState: string, text: string): TestStateResult => {
  switch (testOverlayState) {
    case TestOverlayState.Fail:
      return {
        error: text,
        status: TestState.Fail,
      }
    case TestOverlayState.Pass:
      return {
        error: '',
        status: TestState.Pass,
      }
    case TestOverlayState.Skip:
      return {
        error: '',
        status: TestState.Skip,
      }
    default:
      throw new Error(`unexpected test state: ${testOverlayState}`)
  }
}
