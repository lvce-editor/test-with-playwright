import * as IpcChildModule from '../IpcChildModule/IpcChildModule.js'

export const listen = async ({ method, ...params }) => {
  const module = await IpcChildModule.getModule(method)
  // @ts-ignore
  const rawIpc = await module.listen(params)
  const ipc = module.wrap(rawIpc)
  return ipc
}
