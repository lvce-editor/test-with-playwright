export const name = 'sample.editor-insert-line-break'

export const skip = ['webkit']

export const test = async ({ Editor, FileSystem, Main, Workspace }) => {
  const workspaceUrl = await FileSystem.getTmpDir()
  const fileUri = `${workspaceUrl}/editor-insert-line-break.txt`
  await FileSystem.writeFile(fileUri, 'hello world\n')
  await Workspace.setPath(workspaceUrl)
  await Main.closeAllEditors()
  await Main.openUri(fileUri)

  await Editor.setCursor(0, 5)
  await Editor.insertLineBreak()

  await Editor.shouldHaveText('hello\n world\n')
  await Editor.shouldHaveSelections(new Uint32Array([1, 0, 1, 0]))
}
