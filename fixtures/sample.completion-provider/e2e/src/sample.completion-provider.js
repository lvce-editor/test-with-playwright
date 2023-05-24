export const name = 'sample.completion-provider'

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
  await expect(completionItems).toHaveCount(3)
  await expect(completionItems.nth(0)).toHaveText('Option A')
  await expect(completionItems.nth(1)).toHaveText('Option B')
  await expect(completionItems.nth(2)).toHaveText('Option C')
}
