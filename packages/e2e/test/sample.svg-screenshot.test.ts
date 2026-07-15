import { afterEach, expect, test } from '@jest/globals'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFixture } from '../src/_runFixture.ts'

const temporaryDirectories: string[] = []
const externalResourceRegex = /\b(?:href|src)=["']https?:|url\(["']?https?:/i
const svgStartRegex = /^<svg /

afterEach(async () => {
  const directories = [...temporaryDirectories]
  temporaryDirectories.length = 0
  await Promise.all(directories.map((directory) => rm(directory, { force: true, recursive: true })))
})

test('sample.svg-screenshot creates a self-contained deterministic snapshot', async (): Promise<void> => {
  const directory = await mkdtemp(join(tmpdir(), 'test-with-playwright-svg-'))
  temporaryDirectories.push(directory)
  const commonArguments = [`--svg-screenshot-dir=${directory}`]

  const updateResult = await runFixture('sample.hello-world', [...commonArguments, '--update-svg-screenshots'])
  expect(updateResult.exitCode).toBe(0)

  const browser = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'
  const snapshotPath = join(directory, `sample.hello-world.${browser}.svg`)
  const svg = await readFile(snapshotPath, 'utf8')
  expect(svg).toMatch(svgStartRegex)
  expect(svg).not.toMatch(externalResourceRegex)
  expect(svg).not.toContain('<script')
  expect(svg).not.toContain('TestOverlay')
  expect(svg.length).toBeLessThan(100_000)

  const compareResult = await runFixture('sample.hello-world', commonArguments)
  expect(compareResult.exitCode).toBe(0)
})
