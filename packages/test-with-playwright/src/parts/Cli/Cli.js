import * as HandleCliArgs from '../HandleCliArgs/HandleCliArgs.js'
import * as Process from '../Process/Process.js'
import * as ProcessListeners from '../ProcessListeners/ProcessListeners.js'
import * as CommandState from '../CommandState/CommandState.js'
import * as CommandMap from '../CommandMap/CommandMap.js'

export const main = () => {
  Process.on('uncaughtExceptionMonitor', ProcessListeners.handleUncaughtExceptionMonitor)
  CommandState.registerCommands(CommandMap.commandMap)
  HandleCliArgs.handleCliArgs({ argv: Process.argv, env: Process.env })
}

main()
