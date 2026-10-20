import type { Page } from '@playwright/test'
import { lstat } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import * as CaptureSvgScreenshot from '../CaptureSvgScreenshot/CaptureSvgScreenshot.ts'
import * as ComparePngScreenshot from '../ComparePngScreenshot/ComparePngScreenshot.ts'
import * as IsEnoentError from '../IsEnoentError/IsEnoentError.ts'

const installed = new WeakSet<Page>()

export const resolveFixture = async (directory: string, uri: unknown): Promise<string> => {
  if (
    typeof uri !== 'string' ||
    (!uri.endsWith('.svg') && !uri.endsWith('.png')) ||
    isAbsolute(uri) ||
    uri.includes('\\') ||
    uri.includes(':') ||
    uri.includes('\0') ||
    uri.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    throw new Error(
      `[SCREENSHOT_INVALID_URI] Expected a relative .svg or .png path inside e2e/fixtures: ${String(uri)}`,
    )
  }
  let current = resolve(directory)
  for (const part of ['', ...uri.split('/')]) {
    current = join(current, part)
    try {
      const stat = await lstat(current)
      if (stat.isSymbolicLink()) {
        throw new Error(`[SCREENSHOT_INVALID_URI] Symbolic links are not supported: ${uri}`)
      }
    } catch (error) {
      if (!IsEnoentError.isEnoentError(error)) {
        throw error
      }
    }
  }
  return current
}

export const install = async (page: Page, testPath: string, update: boolean): Promise<void> => {
  if (installed.has(page)) {
    return
  }
  const directory = resolve(testPath, 'fixtures')
  let previous: Promise<unknown> = Promise.resolve()
  await page.exposeBinding('lvceMatchScreenshot', async ({ frame }, uri: unknown, token: string) => {
    const run = async (): Promise<void> => {
      const fixturePath = await resolveFixture(directory, uri)
      const element = await frame.evaluateHandle((token) => {
        const host = globalThis as typeof globalThis & { lvceScreenshotTargets?: Map<string, Element> }
        return host.lvceScreenshotTargets?.get(token) || null
      }, token)
      try {
        if (!element.asElement()) {
          throw new Error(`[SCREENSHOT_ELEMENT_NOT_FOUND] ${String(uri)}`)
        }
        if (fixturePath.endsWith('.png')) {
          await resolveFixture(directory, `${String(uri)}.actual.png`)
          const png = await element.asElement()!.screenshot({ animations: 'disabled', caret: 'hide' })
          await ComparePngScreenshot.compare(fixturePath, png, update)
        } else {
          const svg = await CaptureSvgScreenshot.capture(frame, element.asElement()!)
          await CaptureSvgScreenshot.compareSvgScreenshot({
            fixturePath,
            options: { directory: dirname(fixturePath), name: '', update },
            svg,
            test: '',
          })
        }
      } finally {
        await element.dispose()
      }
    }
    // Capture changes document styles temporarily; serialize concurrent assertions on this page.
    const prior = previous
    const result = (async (): Promise<void> => {
      await prior
      await run()
    })()
    previous = (async (): Promise<void> => {
      try {
        await result
      } catch {
        // A failed assertion must not prevent later requests from being handled.
      }
    })()
    return result
  })
  installed.add(page)
}
