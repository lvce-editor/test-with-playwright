import { NodeWorkerRpcClient } from '@lvce-editor/rpc'
import * as CommandMap from '../CommandMap/CommandMap.ts'
import * as Process from '../Process/Process.ts'
import * as ProcessListeners from '../ProcessListeners/ProcessListeners.ts'
import { set } from '@lvce-editor/rpc-registry'
import { Cli } from '../RpcId/RpcId.ts'

const handleDisconnect = (): void => {
  console.log('[test-worker] disconnected')
}

const handleExit = (): void => {
  console.log('[test-worker] exiting')
}

const handleSigint = (): void => {
  console.log('[test-worker] sigint')
}

const handleSigTerm = (): void => {
  console.log('[test-worker] sigterm')
}

export const main = async (): Promise<void> => {
  Process.on('disconnect', handleDisconnect)
  Process.on('exit', handleExit)
  Process.on('SIGINT', handleSigint)
  Process.on('SIGTERM', handleSigTerm)
  Process.on('uncaughtExceptionMonitor', ProcessListeners.handleUncaughtExceptionMonitor)
  const rpc = await NodeWorkerRpcClient.create({
    commandMap: CommandMap.commandMap,
  })
  set(Cli, rpc)
}
