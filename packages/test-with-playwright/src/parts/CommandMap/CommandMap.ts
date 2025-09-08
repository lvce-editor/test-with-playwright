import * as CliCommandType from '../CliCommandType/CliCommandType.ts'
import * as HandleFinalResult from '../HandleFinalResult/HandleFinalResult.ts'
import * as HandleResult from '../HandleResult/HandleResult.ts'

export const commandMap = {
  [CliCommandType.HandleResult]: HandleResult.handleResult,
  [CliCommandType.HandleFinalResult]: HandleFinalResult.handleFinalResult,
}
