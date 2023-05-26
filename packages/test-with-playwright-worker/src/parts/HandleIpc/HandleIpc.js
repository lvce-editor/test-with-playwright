import * as Assert from '../Assert/Assert.js'
import * as GetResponse from '../GetResponse/GetResponse.js'

export const handleIpc = (ipc) => {
  Assert.object(ipc)
  const handleMessage = async (message) => {
    const response = await GetResponse.getResponse(message)
    if (response) {
      ipc.send(response)
    }
  }
  ipc.on('message', handleMessage)
}
