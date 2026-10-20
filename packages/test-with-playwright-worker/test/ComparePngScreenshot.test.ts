import { afterEach, expect, test } from '@jest/globals'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { compare } from '../src/parts/ComparePngScreenshot/ComparePngScreenshot.ts'

const directories: string[] = []
afterEach(async () => {
  const pending = [...directories]
  directories.length = 0
  await Promise.all(pending.map((directory) => rm(directory, { force: true, recursive: true })))
})
const createPath = async (): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), 'png-comparison-'))
  directories.push(directory)
  return join(directory, 'nested', 'about.png')
}

test('missing PNG explains update mode and ordinary runs create no baseline', async () => {
  const path = await createPath()
  await expect(compare(path, Buffer.from('image'), false)).rejects.toThrow('[SCREENSHOT_MISSING]')
  await expect(readFile(path)).rejects.toMatchObject({ code: 'ENOENT' })
  expect(await readFile(`${path}.actual.png`)).toEqual(Buffer.from('image'))
})

test('creates and replaces a PNG only in update mode, accepting matching bytes', async () => {
  const path = await createPath()
  const image = Buffer.from('image')
  await compare(path, image, true)
  await compare(path, image, false)
  const replacement = Buffer.from('new image')
  await expect(compare(path, replacement, false)).rejects.toThrow('[SCREENSHOT_MISMATCH]')
  expect(await readFile(path)).toEqual(image)
  expect(await readFile(`${path}.actual.png`)).toEqual(replacement)
  await compare(path, replacement, true)
  expect(await readFile(path)).toEqual(replacement)
  await expect(readFile(`${path}.actual.png`)).rejects.toMatchObject({ code: 'ENOENT' })
})

test('matching PNG removes stale actual output', async () => {
  const path = await createPath()
  const image = Buffer.from('image')
  await compare(path, image, true)
  await writeFile(`${path}.actual.png`, 'stale')
  await compare(path, image, false)
  await expect(readFile(`${path}.actual.png`)).rejects.toMatchObject({ code: 'ENOENT' })
})

test('preserves filesystem errors other than missing files', async () => {
  const path = await createPath()
  await mkdir(path, { recursive: true })
  await expect(compare(path, Buffer.from('image'), false)).rejects.toThrow()
})
