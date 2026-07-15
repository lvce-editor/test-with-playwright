import type { Page } from '@playwright/test'
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SvgScreenshotOptions } from '../SvgScreenshotOptions/SvgScreenshotOptions.ts'
import * as IsEnoentError from '../IsEnoentError/IsEnoentError.ts'

const browserScriptCache: { promise?: Promise<string> } = {}
const fileExtensionRegex = /\.[^.]+$/
const tagBoundaryRegex = />\s*</g

const getBrowserScriptCandidates = (): readonly string[] => {
  return [
    fileURLToPath(new URL('svgScreenshot.js', import.meta.url)),
    fileURLToPath(new URL('../../../../../dist/test-with-playwright-worker/dist/svgScreenshot.js', import.meta.url)),
  ]
}

const readBrowserScript = async (): Promise<string> => {
  for (const candidate of getBrowserScriptCandidates()) {
    try {
      await access(candidate)
      return await readFile(candidate, 'utf8')
    } catch {
      // Try the next development or distribution path.
    }
  }
  throw new Error('[test-with-playwright] SVG screenshot browser script not found; run npm run build')
}

const getBrowserScript = (): Promise<string> => {
  browserScriptCache.promise ||= readBrowserScript()
  return browserScriptCache.promise
}

const capture = async (page: Page, selector: string | undefined): Promise<string> => {
  const browserScript = await getBrowserScript()
  await page.evaluate(browserScript)
  return page.evaluate(async (selector) => {
    const api = (
      globalThis as typeof globalThis & {
        SvgScreenshot?: { capture: (selector: string | undefined) => Promise<string> }
      }
    ).SvgScreenshot
    if (!api) {
      throw new Error('SVG screenshot browser API was not initialized')
    }
    return api.capture(selector)
  }, selector)
}

const formatSvg = (svg: string): string => {
  return `${svg.replaceAll(tagBoundaryRegex, '>\n<').trim()}\n`
}

const getSnapshotName = (test: string, name: string): string => {
  const fileName = basename(test).replace(fileExtensionRegex, '')
  return `${fileName}.${name}.svg`
}

export const captureSvgScreenshot = async ({
  options,
  page,
  test,
}: {
  readonly options: SvgScreenshotOptions
  readonly page: Page
  readonly test: string
}): Promise<void> => {
  const svg = await capture(page, options.selector)
  await compareSvgScreenshot({ options, svg, test })
}

export const compareSvgScreenshot = async ({
  options,
  svg,
  test,
}: {
  readonly options: SvgScreenshotOptions
  readonly svg: string
  readonly test: string
}): Promise<void> => {
  const formattedSvg = formatSvg(svg)
  const snapshotPath = join(options.directory, getSnapshotName(test, options.name))
  const actualPath = `${snapshotPath}.actual`
  if (options.update) {
    await mkdir(options.directory, { recursive: true })
    await writeFile(snapshotPath, formattedSvg)
    await rm(actualPath, { force: true })
    return
  }
  let expected: string
  try {
    expected = await readFile(snapshotPath, 'utf8')
  } catch (error) {
    if (IsEnoentError.isEnoentError(error)) {
      throw new Error(
        `[test-with-playwright] SVG screenshot is missing: ${snapshotPath}. Run with --update-svg-screenshots to create it.`,
      )
    }
    throw error
  }
  if (expected !== formattedSvg) {
    await mkdir(options.directory, { recursive: true })
    await writeFile(actualPath, formattedSvg)
    throw new Error(`[test-with-playwright] SVG screenshot differs: ${snapshotPath}. Actual output: ${actualPath}`)
  }
  await rm(actualPath, { force: true })
}
