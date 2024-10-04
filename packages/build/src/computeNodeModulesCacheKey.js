import { readFile } from 'fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { root } from './root.js'

const locations = [
  'lerna.json',
  'package-lock.json',
  'packages/e2e/package-lock.json',
  'packages/test-with-playwright/package-lock.json',
  'packages/test-with-playwright-worker/package-lock.json',
  'packages/build/package-lock.json',
  'scripts/computeNodeModulesCacheKey.js',
  '.github/workflows/ci.yml',
  '.github/workflows/release.yml',
]

const getAbsolutePath = (relativePath) => {
  return join(root, relativePath)
}

const getContent = (absolutePath) => {
  return readFile(absolutePath)
}

export const computeHash = (contents) => {
  const hash = createHash('sha1')
  if (Array.isArray(contents)) {
    for (const content of contents) {
      hash.update(content)
    }
  } else if (typeof contents === 'string') {
    hash.update(contents)
  }
  return hash.digest('hex')
}

const computeCacheKey = async (locations) => {
  const absolutePaths = locations.map(getAbsolutePath)
  const contents = await Promise.all(absolutePaths.map(getContent))
  const hash = computeHash(contents)
  return hash
}

const main = async () => {
  const hash = await computeCacheKey(locations)
  process.stdout.write(hash)
}

main()
