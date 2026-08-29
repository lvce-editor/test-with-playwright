export const name = 'sample.filesystem-write-file'

export const test = async ({ Editor, FileSystem, Main, Workspace }) => {
  const workspaceUrl = await FileSystem.getTmpDir()
  const fileUri = `${workspaceUrl}/written-by-e2e.txt`

  await FileSystem.writeFile(fileUri, 'written through the e2e API\n')

  await FileSystem.shouldHaveFile(fileUri, 'written through the e2e API\n')

  await Workspace.setPath(workspaceUrl)
  await Main.closeAllEditors()
  await Main.openUri(fileUri)
  await Editor.shouldHaveText('written through the e2e API\n')
}
