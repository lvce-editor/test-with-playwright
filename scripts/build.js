import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const FILES = ['src', 'README.md']

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const getVersion = () => {
  if (process.env.RG_VERSION) {
    if (process.env.RG_VERSION.startsWith('v')) {
      return process.env.RG_VERSION.slice(1)
    }
    return process.env.RG_VERSION
  }
  return '0.0.0-dev'
}

const createDist = () => {
  mkdirSync(join(root, 'dist'), { recursive: true })
}

const copyPackageJson = () => {
  const packageJson = JSON.parse(
    readFileSync(join(root, 'package.json'), 'utf-8')
  )
  packageJson.version = getVersion()
  writeFileSync(
    join(root, 'dist', 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n'
  )
}

const copyFiles = () => {
  for (const file of FILES) {
    cpSync(join(root, file), join(root, 'dist', file), {
      recursive: true,
      force: true,
    })
  }
}

const main = () => {
  createDist()
  copyPackageJson()
  copyFiles()
}

main()
