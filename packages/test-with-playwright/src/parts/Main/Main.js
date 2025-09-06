import * as CommandMap from '../CommandMap/CommandMap.js'
import * as HandleCliArgs from '../HandleCliArgs/HandleCliArgs.js'
import * as Process from '../Process/Process.js'
import * as ProcessListeners from '../ProcessListeners/ProcessListeners.js'

export const main = async () => {
  Process.on('uncaughtExceptionMonitor', ProcessListeners.handleUncaughtExceptionMonitor)
  await HandleCliArgs.handleCliArgs({ argv: Process.argv, env: Process.env, commandMap: CommandMap.commandMap })
}
