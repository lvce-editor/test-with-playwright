export const getServerPath = async () => {
  const { serverPath } = await import('@lvce-editor/server')
  return serverPath
}
