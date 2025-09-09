import _getPort from 'get-port'

export const getPort = (): Promise<number> => {
  // @ts-ignore
  return _getPort()
}
