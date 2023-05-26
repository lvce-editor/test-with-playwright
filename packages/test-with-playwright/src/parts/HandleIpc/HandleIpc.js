import * as Callback from '../Callback/Callback.js'

export function handleIpc(ipc) {
  const handleMessage = (message) => {
    if ('result' in message || 'error' in message) {
      Callback.resolve(message.id, message)
      return
    }
  }
  ipc.on('message', handleMessage)
}
