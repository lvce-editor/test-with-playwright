import { execSync } from 'child_process'
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const FILES = ['src', 'README.md']

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const getVersion = () => {
  const stdout = execSync('git describe --exact-match --tags').toString().trim()
  if (stdout.startsWith('v')) {
    return stdout.slice(1)
  }
  return stdout
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