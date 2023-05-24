import { completionCount } from './_util.js'

export const name = 'sample.with-utility-file'

export const test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/test.txt`,
    ['   line   ', '   line   ', '   line   '].join('\n')
  )
  await Main.openUri(`${tmpDir}/test.txt`)
  await Editor.setCursor(0, 7)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems).toHaveCount(completionCount)
}
