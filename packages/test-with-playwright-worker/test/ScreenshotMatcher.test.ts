import { afterEach, expect, test } from '@jest/globals'
import { mkdir, mkdtemp, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { resolveFixture } from '../src/parts/ScreenshotMatcher/ScreenshotMatcher.ts'

const directories: string[] = []
afterEach(async () => {
  const pending = [...directories]
  directories.length = 0
  await Promise.all(pending.map((directory) => rm(directory, { force: true, recursive: true })))
})

test.each([
  '../escape.svg',
  '/tmp/a.svg',
  'a/../../b.svg',
  'file:///tmp/a.svg',
  'a\\b.svg',
  '',
  'a.jpg',
  'a//b.svg',
  './a.svg',
  'a\0.svg',
])('rejects invalid screenshot URI %s', async (uri) => {
  await expect(resolveFixture('/tmp/fixtures', uri)).rejects.toThrow('[SCREENSHOT_INVALID_URI]')
})

test('resolves nested fixture paths without creating them', async () => {
  await expect(resolveFixture('/tmp/fixtures', 'about/dialog.svg')).resolves.toBe(
    resolve('/tmp/fixtures', 'about/dialog.svg'),
  )
})

test('rejects symbolic links at the root, directory and file', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'screenshot-path-'))
  directories.push(directory)
  const outside = join(directory, 'outside')
  const fixtures = join(directory, 'fixtures')
  await mkdir(outside)
  await symlink(outside, fixtures)
  await expect(resolveFixture(fixtures, 'about.svg')).rejects.toThrow('[SCREENSHOT_INVALID_URI]')
  await rm(fixtures)
  await mkdir(fixtures)
  await symlink(outside, join(fixtures, 'nested'))
  await expect(resolveFixture(fixtures, 'nested/about.svg')).rejects.toThrow('[SCREENSHOT_INVALID_URI]')
  await symlink(join(outside, 'about.svg'), join(fixtures, 'about.svg'))
  await expect(resolveFixture(fixtures, 'about.svg')).rejects.toThrow('[SCREENSHOT_INVALID_URI]')
})
