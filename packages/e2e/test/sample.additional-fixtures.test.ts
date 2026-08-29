import { expect, test } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

const testPassedRegex = /1 test passed in \d+(\.\d+)?ms/

const fixtureNames = [
  'sample.about-dialog',
  'sample.editor-delete-character',
  'sample.editor-insert-line-break',
  'sample.editor-type',
  'sample.filesystem-load-fixture',
  'sample.filesystem-write-file',
  'sample.locator-assertions',
  'sample.main-close-editors',
  'sample.main-open-settings',
  'sample.main-split-right',
] as const

test.each(fixtureNames)('%s', async (fixtureName): Promise<void> => {
  const { exitCode, stdout } = await runFixture(fixtureName)
  expect(exitCode).toBe(0)
  expect(stdout).toMatch(testPassedRegex)
})
