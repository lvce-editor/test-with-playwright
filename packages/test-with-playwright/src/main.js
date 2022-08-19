import { chromium } from '@playwright/test'
import assert from 'assert'
import { fork } from 'child_process'
import { mkdir, mkdtemp, writeFile } from 'fs/promises'
import getPort from 'get-port'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { tmpdir } from 'os'
import { dirname } from 'path'
import { readPackageUp } from 'read-pkg-up'

export const state = {
  /**
   * @type {import('@playwright/test').Page|undefined}
   */
  page: undefined,
  /**
   * @type {import('@playwright/test').Browser|undefined}
   */
  browser: undefined,
  /**
   * @type {import('child_process').ChildProcess|undefined}
   */
  childProcess: undefined,
  /**
   * @type{boolean}
   */
  runImmediately: true,
  /**
   * @type{any}
   */
  port: 0,
  root: undefined,
}

export const getRoot = async () => {
  const rootPackageJson = await readPackageUp()
  if (!rootPackageJson) {
    throw new Error('package json not found')
  }
  return dirname(rootPackageJson.path)
}

const getExtensionFolder = async () => {
  const root = state.root || (await getRoot())
  return join(root, '..', 'extension')
}

export const getTmpDir = (prefix = 'foo-') => {
  return mkdtemp(join(tmpdir(), prefix))
}

const launchServer = async ({ port, folder, env }) => {
  const { serverPath } = await import('@lvce-editor/server')
  // TODO disable saving state between tests in settings
  const configDir = await getTmpDir()
  await mkdir(join(configDir, 'lvce-oss'), { recursive: true })
  await writeFile(
    join(configDir, 'lvce-oss', 'settings.json'),
    JSON.stringify(
      {
        'workbench.saveStateOnVisibilityChange': false,
      },
      null,
      2
    )
  )
  const extensionFolder = await getExtensionFolder()
  const childProcess = fork(serverPath, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: port,
      FOLDER: folder,
      ONLY_EXTENSION: extensionFolder,
      XDG_CONFIG_HOME: configDir,
      ...env,
    },
  })
  state.childProcess = childProcess
  return new Promise((resolve, reject) => {
    const handleMessage = (message) => {
      if (message === 'ready') {
        resolve(undefined)
      } else {
        reject(new Error('expected ready message'))
      }
    }
    childProcess.once('message', handleMessage)
  })
}

const startBrowser = async ({ port, headless = false }) => {
  assert(!state.browser, 'Browser should not be defined')
  console.info('START BROWSER')
  const browser = await chromium.launch({
    headless,
  })
  state.browser = browser
  const page = await browser.newPage({})
  state.page = page
  return page
}

export const runTest = async ({ name, fn }) => {
  const start = performance.now()
  console.info(`[test] running ${name}`)
  await fn()
  const end = performance.now()
  const duration = end - start
  console.info(`[test] passed ${name} in ${duration}ms`)
}

export const startAll = async () => {
  const port = await getPort()
  await launchServer({
    port,
    env: {},
    folder: '',
  })
  state.port = port
  const headless = process.argv.includes('--headless')
  const page = await startBrowser({ port, headless })
  return { page, port }
}

export const closeAll = async () => {
  if (state.childProcess) {
    state.childProcess.kill('SIGTERM')
    state.childProcess = undefined
  }
  if (state.page) {
    await state.page.close()
    state.page = undefined
  }
  if (state.browser) {
    await state.browser.close()
    state.browser = undefined
  }
}
