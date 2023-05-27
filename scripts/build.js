import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path, { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const packagePath = join(root, 'packages', 'test-with-playwright')
const packageWorkerPath = join(root, 'packages', 'test-with-playwright-worker')

const getVersion = () => {
  try {
    const stdout = execSync('git describe --exact-match --tags', { stdio: 'pipe' }).toString().trim()
    if (stdout.startsWith('v')) {
      return stdout.slice(1)
    }
    return stdout
  } catch (error) {
    if (error && error.message.includes('no tag exactly matches')) {
      return '0.0.0-dev'
    }
    throw error
  }
}

const createDist = () => {
  mkdirSync(join(root, 'dist'), { recursive: true })
}

const readJson = (path) => {
  return JSON.parse(readFileSync(join(path), 'utf-8'))
}

const writeJson = (path, value) => {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n')
}

const copyPackageJson = () => {
  const packageJson = readJson(join(packagePath, 'package.json'))
  packageJson.version = getVersion()
  delete packageJson.scripts
  delete packageJson.prettier
  delete packageJson.jest
  mkdirSync(join(root, 'dist', 'test-with-playwright'))
  writeJson(join(root, 'dist', 'test-with-playwright', 'package.json'), packageJson)
}

const copyWorkerPackageJson = () => {
  const packageJson = readJson(join(packageWorkerPath, 'package.json'))
  packageJson.version = getVersion()
  delete packageJson.scripts
  delete packageJson.prettier
  delete packageJson.jest
  mkdirSync(join(root, 'dist', 'test-with-playwright-worker'))
  writeJson(join(root, 'dist', 'test-with-playwright-worker', 'package.json'), packageJson)
}

const copyFiles = () => {
  cpSync(join(packagePath, 'src'), join(root, 'dist', 'test-with-playwright', 'src'), {
    recursive: true,
    force: true,
  })
  cpSync(join(packagePath, 'bin'), join(root, 'dist', 'test-with-playwright', 'bin'), {
    recursive: true,
    force: true,
  })
  cpSync(join(root, 'README.md'), join(root, 'dist', 'test-with-playwright', 'README.md'), {
    recursive: true,
    force: true,
  })
}

const copyWorkerFiles = () => {
  cpSync(join(packageWorkerPath, 'src'), join(root, 'dist', 'test-with-playwright-worker', 'src'), {
    recursive: true,
    force: true,
  })
}

const cleanDist = () => {
  rmSync(join(root, 'dist'), { recursive: true, force: true })
}

const main = () => {
  cleanDist()
  createDist()
  copyPackageJson()
  copyFiles()
  copyWorkerPackageJson()
  copyWorkerFiles()
}

main()
