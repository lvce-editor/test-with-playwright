import * as Command from '../Command/Command.js'
import * as CommandMap from '../CommandMap/CommandMap.js'
import * as HandleCliArgs from '../HandleCliArgs/HandleCliArgs.js'
import * as Process from '../Process/Process.js'
import * as ProcessListeners from '../ProcessListeners/ProcessListeners.js'

export const main = () => {
  Process.on('uncaughtExceptionMonitor', ProcessListeners.handleUncaughtExceptionMonitor)
  Command.register(CommandMap.commandMap)
  HandleCliArgs.handleCliArgs({ argv: Process.argv, env: Process.env })
}
