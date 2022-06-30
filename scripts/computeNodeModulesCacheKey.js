import { readFile } from 'fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const locations = [
  'lerna.json',
  'package-lock.json',
  'packages/e2e/package-lock.json',
  'packages/test-with-playwright/package-lock.json',
  'scripts/computeNodeModulesCacheKey.js',
]

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

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
