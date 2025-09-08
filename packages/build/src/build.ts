import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { root } from './root.ts'
import { generateApiTypes } from './generateApiTypes.ts'

const packagePath = join(root, 'packages', 'test-with-playwright')
const packageWorkerPath = join(root, 'packages', 'test-with-playwright-worker')

const getVersion = (): string => {
  try {
    const stdout = execSync('git describe --exact-match --tags', { stdio: 'pipe' }).toString().trim()
    if (stdout.startsWith('v')) {
      return stdout.slice(1)
    }
    return stdout
  } catch (error) {
    if (error && (error as Error).message.includes('no tag exactly matches')) {
      return '0.0.0-dev'
    }
    throw error
  }
}

const createDist = (): void => {
  mkdirSync(join(root, 'dist'), { recursive: true })
}

const readJson = (path: string): any => {
  return JSON.parse(readFileSync(join(path), 'utf-8'))
}

const writeJson = (path: string, value: any): void => {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n')
}

const copyPackageJson = (version: string, testWorkerVersion: string): void => {
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

const copyWorkerPackageJson = (version: string): void => {
  const packageJson = readJson(join(packageWorkerPath, 'package.json'))
  packageJson.version = version
  delete packageJson.scripts
  delete packageJson.prettier
  delete packageJson.jest
  mkdirSync(join(root, 'dist', 'test-with-playwright-worker'))
  writeJson(join(root, 'dist', 'test-with-playwright-worker', 'package.json'), packageJson)
}

const copyFiles = async (): Promise<void> => {
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
    `import { fileURLToPath } from 'node:url'

export const getTestWorkerPath = () => {
  const url = import.meta.resolve('@lvce-editor/test-with-playwright-worker')
  const path = fileURLToPath(url)
  return path
}
`,
  )
}

const copyWorkerFiles = (): void => {
  cpSync(join(packageWorkerPath, 'src'), join(root, 'dist', 'test-with-playwright-worker', 'src'), {
    recursive: true,
    force: true,
  })
}

const cleanDist = (): void => {
  rmSync(join(root, 'dist'), { recursive: true, force: true })
}

const main = async (): Promise<void> => {
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
