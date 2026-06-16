import { expect, test } from '@jest/globals'
import { join } from 'node:path'
import { runFixture } from '../src/_runFixture.ts'
import { root } from '../src/root.ts'

const testPassedRegex = /1 test passed in \d+(\.\d+)?ms/

if (process.env['TEST_WITH_PLAYWRIGHT_ELECTRON'] === '1') {
  test('sample.electron', async (): Promise<void> => {
    const { exitCode, stdout } = await runFixture('sample.electron', [
      '--runtime=electron',
      '--electron-version=v0.84.0',
      `--electron-cache-dir=${join(root, '.test-with-playwright', 'electron')}`,
    ])
    expect(exitCode).toBe(0)
    expect(stdout).toMatch(testPassedRegex)
  })
} else {
  test.todo('sample.electron disabled')
}
