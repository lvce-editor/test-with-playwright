import { NodeWorkerRpcClient } from '@lvce-editor/rpc'
import * as CommandMap from '../CommandMap/CommandMap.js'
import * as Process from '../Process/Process.js'
import * as ProcessListeners from '../ProcessListeners/ProcessListeners.js'

const handleDisconnect = () => {
  console.log('[test-worker] disconnected')
}

const handleExit = () => {
  console.log('[test-worker] exiting')
}

const handleSigint = () => {
  console.log('[test-worker] sigint')
}

const handleSigTerm = () => {
  console.log('[test-worker] sigterm')
}

export const main = async () => {
  Process.on('disconnect', handleDisconnect)
  Process.on('exit', handleExit)
  Process.on('SIGINT', handleSigint)
  Process.on('SIGTERM', handleSigTerm)
  Process.on('uncaughtExceptionMonitor', ProcessListeners.handleUncaughtExceptionMonitor)
  NodeWorkerRpcClient.create({
    commandMap: CommandMap.commandMap,
  })
}
