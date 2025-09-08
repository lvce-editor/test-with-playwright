import * as CommandMap from '../CommandMap/CommandMap.ts'
import * as HandleCliArgs from '../HandleCliArgs/HandleCliArgs.ts'
import * as Process from '../Process/Process.ts'
import * as ProcessListeners from '../ProcessListeners/ProcessListeners.ts'

export const main = async (): Promise<void> => {
  Process.on('uncaughtExceptionMonitor', ProcessListeners.handleUncaughtExceptionMonitor)
  await HandleCliArgs.handleCliArgs({
    argv: Process.argv,
    env: Process.env,
    commandMap: CommandMap.commandMap,
    cwd: process.cwd(),
  })
}
