import * as CliCommandType from '../CliCommandType/CliCommandType.js'
import * as HandleResult from '../HandleResult/HandleResult.js'

export const commandMap = {
  [CliCommandType.HandleResult]: HandleResult.handleResult,
}
