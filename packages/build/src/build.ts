import { exec } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { root } from './root.ts'
import { generateApiTypes } from './generateApiTypes.ts'
import { bundleJs } from './bundleJs.ts'

const execAsync = promisify(exec)

const packagePath = join(root, 'packages', 'test-with-playwright')
const packageWorkerPath = join(root, 'packages', 'test-with-playwright-worker')

const getVersion = async (): Promise<string> => {
  try {
    const { stdout } = await execAsync('git describe --exact-match --tags')
    const trimmed = stdout.trim()
    if (trimmed.startsWith('v')) {
      return trimmed.slice(1)
    }
    return trimmed
  } catch (error) {
    if (error && (error as Error).message.includes('no tag exactly matches')) {
      return '0.0.0-dev'
    }
    throw error
  }
}

const createDist = async (): Promise<void> => {
  await mkdir(join(root, 'dist'), { recursive: true })
}

const readJson = async (path: string): Promise<any> => {
  const content = await readFile(join(path), 'utf-8')
  return JSON.parse(content)
}

const writeJson = async (path: string, value: any): Promise<void> => {
  await writeFile(path, JSON.stringify(value, null, 2) + '\n')
}

const copyPackageJson = async (version: string, testWorkerVersion: string): Promise<void> => {
  const packageJson = await readJson(join(packagePath, 'package.json'))
  packageJson.version = version
  delete packageJson.scripts
  delete packageJson.prettier
  delete packageJson.jest
  packageJson.types = 'api.d.ts'
  packageJson.dependencies = packageJson.dependencies || {}
  packageJson.dependencies['@lvce-editor/test-with-playwright-worker'] = `${version}`
  packageJson.dependencies['@lvce-editor/test-worker'] = testWorkerVersion
  delete packageJson.dependencies['@lvce-editor/assert']
  delete packageJson.dependencies['@lvce-editor/rpc']
  delete packageJson.dependencies['@lvce-editor/verror']
  delete packageJson.dependencies['minimist']
  delete packageJson.dependencies['get-port']
  packageJson.main = packageJson.main = 'dist/main.js'
  await mkdir(join(root, 'dist', 'test-with-playwright'), { recursive: true })
  await writeJson(join(root, 'dist', 'test-with-playwright', 'package.json'), packageJson)
}

const copyWorkerPackageJson = async (version: string): Promise<void> => {
  const packageJson = await readJson(join(packageWorkerPath, 'package.json'))
  packageJson.version = version
  delete packageJson.scripts
  delete packageJson.prettier
  delete packageJson.jest
  delete packageJson.dependencies['@lvce-editor/assert']
  delete packageJson.dependencies['@lvce-editor/rpc']
  delete packageJson.dependencies['@lvce-editor/rpc-registry']
  delete packageJson.dependencies['@lvce-editor/verror']
  delete packageJson.dependencies['get-port']
  packageJson.main = packageJson.main = 'dist/workerMain.js'
  await mkdir(join(root, 'dist', 'test-with-playwright-worker'), { recursive: true })
  await writeJson(join(root, 'dist', 'test-with-playwright-worker', 'package.json'), packageJson)
}

const copyCliFiles = async (): Promise<void> => {
  await cp(join(packagePath, 'bin'), join(root, 'dist', 'test-with-playwright', 'bin'), {
    recursive: true,
    force: true,
  })
  const originalBin = await readFile(
    join(root, 'dist', 'test-with-playwright', 'bin', 'test-with-playwright.js'),
    'utf8',
  )
  const newContent = originalBin.replace('../src/main.ts', '../dist/main.js')
  await writeFile(join(root, 'dist', 'test-with-playwright', 'bin', 'test-with-playwright.js'), newContent)
  await cp(join(root, 'README.md'), join(root, 'dist', 'test-with-playwright', 'README.md'), {
    recursive: true,
    force: true,
  })
  await cp(join(root, 'LICENSE'), join(root, 'dist', 'test-with-playwright', 'LICENSE'), {
    recursive: true,
    force: true,
  })
  await bundleJs({
    inputFile: join(root, 'packages', 'test-with-playwright', 'src', 'main.ts'),
    outputFile: join(root, 'dist', 'test-with-playwright', 'dist', 'main.js'),
  })
  const oldContent = await readFile(join(root, 'dist', 'test-with-playwright', 'dist', 'main.js'), 'utf8')
  const newContent2 = oldContent.replace(
    `const path = join(root, 'packages', 'test-with-playwright-worker', 'src', 'workerMain.ts');
  return pathToFileURL(path).toString();`,
    `return import.meta.resolve('@lvce-editor/test-with-playwright-worker');`,
  )
  await writeFile(join(root, 'dist', 'test-with-playwright', 'dist', 'main.js'), newContent2)
}

const copyWorkerFiles = async (): Promise<void> => {
  await cp(join(root, 'LICENSE'), join(root, 'dist', 'test-with-playwright-worker', 'LICENSE'), {
    recursive: true,
    force: true,
  })
  await bundleJs({
    inputFile: join(root, 'packages', 'test-with-playwright-worker', 'src', 'workerMain.ts'),
    outputFile: join(root, 'dist', 'test-with-playwright-worker', 'dist', 'workerMain.js'),
  })
}

const cleanDist = async (): Promise<void> => {
  await rm(join(root, 'dist'), { recursive: true, force: true })
}

const main = async (): Promise<void> => {
  const version = await getVersion()
  const buildPackageJson = await readJson(join(root, 'packages', 'build', 'package.json'))
  const testWorkerVersion = buildPackageJson.dependencies['@lvce-editor/test-worker']
  await cleanDist()
  await createDist()
  await copyPackageJson(version, testWorkerVersion)
  await copyCliFiles()
  await copyWorkerPackageJson(version)
  await copyWorkerFiles()
  await generateApiTypes()
}

main()
