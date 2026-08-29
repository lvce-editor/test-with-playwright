export const name = 'sample.filesystem-load-fixture'

export const skip = ['webkit']

export const test = async ({ Editor, FileSystem, Main, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/sample.load-fixture')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)

  await Main.openUri(`${workspaceUrl}/example-file.txt`)

  await Editor.shouldHaveText('loaded fixture\n')
}
