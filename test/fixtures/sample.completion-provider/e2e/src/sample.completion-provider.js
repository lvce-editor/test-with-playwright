import { mkdtemp, writeFile } from 'fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'os'
import {
  runWithExtension,
  test,
  expect,
} from '@lvce-editor/test-with-playwright'

const getTmpDir = () => {
  return mkdtemp(join(tmpdir(), 'foo-'))
}

test('sample.completion-provider', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    `${tmpDir}/test.txt`,
    ['   line   ', '   line   ', '   line   '].join('\n')
  )
  const page = await runWithExtension({
    folder: tmpDir,
  })
  const testTxt = page.locator('text=test.txt')
  await testTxt.click()
  const tokenText = page.locator('.Token.Text').nth(1)
  await tokenText.click()
  await page.keyboard.press('End')

  await page.keyboard.press('Control+Space')

  const completions = page.locator('#Completions')
  await expect(completions).toBeVisible()

  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems).toHaveCount(3)
  await expect(completionItems.nth(0)).toHaveText('Option A')
  await expect(completionItems.nth(1)).toHaveText('Option B')
  await expect(completionItems.nth(2)).toHaveText('Option C')
})
