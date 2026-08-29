export const name = 'sample.main-close-editors'

export const test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const workspaceUrl = await FileSystem.getTmpDir()
  const oneUri = `${workspaceUrl}/one.txt`
  const twoUri = `${workspaceUrl}/two.txt`
  await FileSystem.writeFile(oneUri, 'one\n')
  await FileSystem.writeFile(twoUri, 'two\n')
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(oneUri)
  await Main.openUri(twoUri)

  const oneTab = Locator('.TabTitle', { hasText: 'one.txt' })
  const twoTab = Locator('.TabTitle', { hasText: 'two.txt' })
  await expect(oneTab).toBeVisible()
  await expect(twoTab).toBeVisible()

  await Main.closeActiveEditor()

  await expect(oneTab).toBeVisible()
  await expect(twoTab).toBeHidden()

  await Main.closeAllEditors()

  await expect(oneTab).toBeHidden()
  await expect(twoTab).toBeHidden()
}
