export const name = 'sample.editor-delete-character'

export const test = async ({ Editor, FileSystem, Main, Workspace }) => {
  const workspaceUrl = await FileSystem.getTmpDir()
  const fileUri = `${workspaceUrl}/editor-delete-character.txt`
  await FileSystem.writeFile(fileUri, 'hello world\n')
  await Workspace.setPath(workspaceUrl)
  await Main.closeAllEditors()
  await Main.openUri(fileUri)

  await Editor.setCursor(0, 11)
  await Editor.deleteCharacterLeft()

  await Editor.shouldHaveText('hello worl\n')
}
