import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { root } from './root.js'
import { generateApiTypes } from './generateApiTypes.js'

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
    // @ts-ignore
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

const copyPackageJson = (version, testWorkerVersion) => {
  const packageJson = readJson(join(packagePath, 'package.json'))
  packageJson.version = version
  delete packageJson.scripts
  delete packageJson.prettier
  delete packageJson.jest
  packageJson.types = 'api.d.ts'
  packageJson.dependencies = packageJson.dependencies || {}
  packageJson.dependencies['@lvce-editor/test-with-playwright-worker'] = `${version}`
  packageJson.dependencies['@lvce-editor/test-worker'] = testWorkerVersion
  mkdirSync(join(root, 'dist', 'test-with-playwright'))
  writeJson(join(root, 'dist', 'test-with-playwright', 'package.json'), packageJson)
}

const copyWorkerPackageJson = (version) => {
  const packageJson = readJson(join(packageWorkerPath, 'package.json'))
  packageJson.version = version
  packageJson.main = 'index.js'
  delete packageJson.scripts
  delete packageJson.prettier
  delete packageJson.jest
  mkdirSync(join(root, 'dist', 'test-with-playwright-worker'))
  writeJson(join(root, 'dist', 'test-with-playwright-worker', 'package.json'), packageJson)
  packageJson.main = 'index.js'
}

const copyFiles = async () => {
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
  await writeFileSync(
    join(root, 'dist', 'test-with-playwright', 'src', 'parts', 'GetTestWorkerPath', 'GetTestWorkerPath.js'),
    `import { testWorkerPath } from '@lvce-editor/test-with-playwright-worker'

export const getTestWorkerPath = () => {
  return testWorkerPath
}
`,
  )
}

const copyWorkerFiles = () => {
  cpSync(join(packageWorkerPath, 'src'), join(root, 'dist', 'test-with-playwright-worker', 'src'), {
    recursive: true,
    force: true,
  })
  writeFileSync(
    join(root, 'dist', 'test-with-playwright-worker', 'index.js'),
    `import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const testWorkerPath = join(__dirname, 'src', 'workerMain.js')
`,
  )
}

const cleanDist = () => {
  rmSync(join(root, 'dist'), { recursive: true, force: true })
}

const main = async () => {
  const version = getVersion()
  const buildPackageJson = readJson(join(root, 'packages', 'build', 'package.json'))
  const testWorkerVersion = buildPackageJson.dependencies['@lvce-editor/test-worker']
  cleanDist()
  createDist()
  copyPackageJson(version, testWorkerVersion)
  copyFiles()
  copyWorkerPackageJson(version)
  copyWorkerFiles()
  await generateApiTypes()
}

main()
