import getAvailablePort from 'get-port'

export const getPort = (): Promise<number> => {
  return getAvailablePort()
}
