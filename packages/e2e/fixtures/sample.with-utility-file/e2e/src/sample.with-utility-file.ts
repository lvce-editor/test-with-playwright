import { completionCount } from './_util.ts'

export const name = 'sample.with-utility-file'

export const test = async ({ FileSystem, Main, Editor, Locator, expect }: FixtureContext) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test.txt`, `Option`)
  await Main.openUri(`${tmpDir}/test.txt`)
  await Editor.setCursor(0, 6)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems).toHaveCount(completionCount)
}
