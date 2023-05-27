import * as CliCommandType from '../CliCommandType/CliCommandType.js'
import * as HandleFinalResult from '../HandleFinalResult/HandleFinalResult.js'
import * as HandleResult from '../HandleResult/HandleResult.js'

export const commandMap = {
  [CliCommandType.HandleResult]: HandleResult.handleResult,
  [CliCommandType.HandleFinalResult]: HandleFinalResult.handleFinalResult,
}
