export const name = 'sample.editor-type'

export const test = async ({ Editor, FileSystem, Main, Workspace }) => {
  const workspaceUrl = await FileSystem.getTmpDir()
  const fileUri = `${workspaceUrl}/editor-type.txt`
  await FileSystem.writeFile(fileUri, 'hello world\n')
  await Workspace.setPath(workspaceUrl)
  await Main.closeAllEditors()
  await Main.openUri(fileUri)

  await Editor.setCursor(0, 5)
  await Editor.type(' brave')

  await Editor.shouldHaveText('hello brave world\n')
}
