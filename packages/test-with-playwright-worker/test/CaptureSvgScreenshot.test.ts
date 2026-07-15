import { afterEach, expect, test } from '@jest/globals'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as CaptureSvgScreenshot from '../src/parts/CaptureSvgScreenshot/CaptureSvgScreenshot.ts'

const temporaryDirectories: string[] = []

afterEach(async () => {
  const directories = [...temporaryDirectories]
  temporaryDirectories.length = 0
  await Promise.all(directories.map((directory) => rm(directory, { force: true, recursive: true })))
})

const createOptions = async (update: boolean): Promise<{ directory: string; name: string; update: boolean }> => {
  const directory = await mkdtemp(join(tmpdir(), 'svg-screenshots-'))
  temporaryDirectories.push(directory)
  return {
    directory,
    name: 'chromium',
    update,
  }
}

test('compareSvgScreenshot creates a formatted snapshot in update mode', async () => {
  const options = await createOptions(true)
  await CaptureSvgScreenshot.compareSvgScreenshot({
    options,
    svg: '<svg><rect width="1"/></svg>',
    test: 'sample.test.js',
  })

  const snapshot = await readFile(join(options.directory, 'sample.test.chromium.svg'), 'utf8')
  expect(snapshot).toBe('<svg>\n<rect width="1"/>\n</svg>\n')
})

test('compareSvgScreenshot accepts an unchanged snapshot', async () => {
  const options = await createOptions(false)
  await writeFile(join(options.directory, 'sample.test.chromium.svg'), '<svg>\n<rect width="1"/>\n</svg>\n')

  await expect(
    CaptureSvgScreenshot.compareSvgScreenshot({
      options,
      svg: '<svg><rect width="1"/></svg>',
      test: 'sample.test.js',
    }),
  ).resolves.toBeUndefined()
})

test('compareSvgScreenshot writes actual output and rejects a changed snapshot', async () => {
  const options = await createOptions(false)
  const snapshotPath = join(options.directory, 'sample.test.chromium.svg')
  await writeFile(snapshotPath, '<svg>\n<rect width="1"/>\n</svg>\n')

  await expect(
    CaptureSvgScreenshot.compareSvgScreenshot({
      options,
      svg: '<svg><rect width="2"/></svg>',
      test: 'sample.test.js',
    }),
  ).rejects.toThrow(`[test-with-playwright] SVG screenshot differs: ${snapshotPath}`)
  await expect(readFile(`${snapshotPath}.actual`, 'utf8')).resolves.toContain('width="2"')
})

test('compareSvgScreenshot rejects a missing snapshot with update instructions', async () => {
  const options = await createOptions(false)

  await expect(
    CaptureSvgScreenshot.compareSvgScreenshot({
      options,
      svg: '<svg/>',
      test: 'sample.test.js',
    }),
  ).rejects.toThrow('Run with --update-svg-screenshots to create it.')
})
