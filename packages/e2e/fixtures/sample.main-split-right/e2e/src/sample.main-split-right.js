export const name = 'sample.main-split-right'

export const skip = ['webkit']

export const test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  const workspaceUrl = await FileSystem.getTmpDir()
  const leftUri = `${workspaceUrl}/left.txt`
  const rightUri = `${workspaceUrl}/right.txt`
  await FileSystem.writeFile(leftUri, 'left file\n')
  await FileSystem.writeFile(rightUri, 'right file\n')
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(leftUri)

  await Main.splitRight()
  await Main.openUri(rightUri)

  await expect(Locator('.TabTitle', { hasText: 'left.txt' })).toBeVisible()
  await expect(Locator('.TabTitle', { hasText: 'right.txt' })).toBeVisible()
  await Editor.shouldHaveText('right file\n')
}
