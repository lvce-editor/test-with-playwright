import * as RunAllTests from '../RunAllTests/RunAllTests.js'
import * as TestWorkerCommandType from '../TestWorkerCommandType/TestWorkerCommandType.js'

export const commandMap = {
  [TestWorkerCommandType.RunAllTests]: RunAllTests.runAllTests,
}
