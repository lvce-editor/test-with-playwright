import * as IpcParentType from '../IpcParentType/IpcParentType.js'
import { IpcParentWithNodeWorker } from '@lvce-editor/ipc'

export const getModule = (method) => {
  switch (method) {
    case IpcParentType.NodeWorker:
      return IpcParentWithNodeWorker
    default:
      throw new Error('unexpected ipc type')
  }
}
