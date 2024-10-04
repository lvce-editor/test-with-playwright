import * as IpcParentType from '../IpcParentType/IpcParentType.js'

export const getModule = (method) => {
  switch (method) {
    case IpcParentType.NodeWorker:
      return import('../IpcParentWithNodeWorker/IpcParentWithNodeWorker.js')
    default:
      throw new Error('unexpected ipc type')
  }
}
