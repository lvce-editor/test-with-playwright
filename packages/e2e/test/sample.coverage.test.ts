import { afterEach, expect, test } from '@jest/globals'
import { readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { runFixture } from '../src/_runFixture.ts'
import { root } from '../src/root.ts'

const coverageDirectory = join(root, 'packages', 'e2e', 'fixtures', 'sample.hello-world', 'e2e', 'coverage')
const browser = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'

afterEach(async () => {
  await rm(coverageDirectory, { force: true, recursive: true })
})

test('sample.coverage writes Istanbul reports', async (): Promise<void> => {
  if (browser !== 'chromium') {
    return
  }
  const { exitCode, stdout } = await runFixture('sample.hello-world', ['--coverage'])

  expect(exitCode).toBe(0)
  expect(stdout).toContain('JavaScript coverage written to')
  const coverageFinal = JSON.parse(await readFile(join(coverageDirectory, 'coverage-final.json'), 'utf8'))
  const coverageSummary = JSON.parse(await readFile(join(coverageDirectory, 'coverage-summary.json'), 'utf8'))
  const lcov = await readFile(join(coverageDirectory, 'lcov.info'), 'utf8')
  expect(Object.keys(coverageFinal).length).toBeGreaterThan(0)
  expect(coverageSummary.total.lines.total).toBeGreaterThan(0)
  expect(lcov).toContain('SF:')
})
