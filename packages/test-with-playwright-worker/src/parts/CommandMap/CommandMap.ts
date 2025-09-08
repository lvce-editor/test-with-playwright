import * as RunAllTests from '../RunAllTests/RunAllTests.ts'
import * as TestWorkerCommandType from '../TestWorkerCommandType/TestWorkerCommandType.ts'

export const commandMap = {
  [TestWorkerCommandType.RunAllTests]: RunAllTests.runAllTests,
}
