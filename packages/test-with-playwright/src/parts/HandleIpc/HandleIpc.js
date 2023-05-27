import * as Callback from '../Callback/Callback.js'
import * as Command from '../Command/Command.js'

export function handleIpc(ipc) {
  const handleMessage = async (message) => {
    if ('result' in message || 'error' in message) {
      Callback.resolve(message.id, message)
      return
    }
    if ('method' in message) {
      await Command.execute(message.method, ...message.params)
    }
  }
  ipc.on('message', handleMessage)
}
