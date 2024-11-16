import * as Command from '../Command/Command.js'
import * as JsonRpc from '../JsonRpc/JsonRpc.js'

const prepare = (error) => {
  return error
}

const requiresSocket = (method) => {
  return false
}

const logError = (error) => {
  console.error(error)
}

export const handleMessage = (event) => {
  return JsonRpc.handleJsonRpcMessage(
    event.target,
    event.data,
    Command.execute,
    JsonRpc.resolve,
    prepare,
    logError,
    requiresSocket,
  )
}
