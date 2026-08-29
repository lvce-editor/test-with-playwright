import { expect, test } from '@jest/globals'
import { runFixture } from '../src/_runFixture.ts'

const testPassedRegex = /1 test passed in \d+(\.\d+)?ms/
const testSkippedRegex = /1 test skipped in \d+ms/
const browser = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'

const fixtures = [
  ['sample.about-dialog', false],
  ['sample.editor-delete-character', true],
  ['sample.editor-insert-line-break', true],
  ['sample.editor-type', true],
  ['sample.filesystem-load-fixture', true],
  ['sample.filesystem-write-file', true],
  ['sample.locator-assertions', false],
  ['sample.main-close-editors', false],
  ['sample.main-open-settings', false],
  ['sample.main-split-right', true],
] as const

test.each(fixtures)('%s', async (fixtureName, skipWebkit): Promise<void> => {
  const { exitCode, stdout } = await runFixture(fixtureName)
  expect(exitCode).toBe(0)
  const expectedResult = browser === 'webkit' && skipWebkit ? testSkippedRegex : testPassedRegex
  expect(stdout).toMatch(expectedResult)
})
