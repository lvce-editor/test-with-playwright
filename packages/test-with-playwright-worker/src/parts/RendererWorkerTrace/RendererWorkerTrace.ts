import type { Page } from '@playwright/test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

const selector = 'script.RendererWorkerTrace'

const getFileName = (test: string): string => {
  const name = basename(test)
  return `${name.slice(0, -extname(name).length)}.json`
}

export const prepareDirectory = async (directory: string): Promise<void> => {
  await rm(directory, {
    force: true,
    recursive: true,
  })
  await mkdir(directory, {
    recursive: true,
  })
}

export const exportTrace = async ({
  directory,
  page,
  test,
}: {
  readonly directory: string
  readonly page: Page
  readonly test: string
}): Promise<boolean> => {
  let capture: { text: string | undefined; timeline: object | undefined }
  try {
    capture = await page.evaluate((traceSelector) => {
      return {
        text: globalThis.document.querySelector<HTMLScriptElement>(traceSelector)?.textContent || undefined,
        timeline: (globalThis as any).__lvceTraceTimeline?.(),
      }
    }, selector)
  } catch {
    return false
  }
  if (!capture.text && !capture.timeline) {
    return false
  }
  const trace = capture.text ? JSON.parse(capture.text) : { entries: [], version: 1 }
  if (capture.timeline) trace.timeline = capture.timeline
  await writeFile(join(directory, getFileName(test)), `${JSON.stringify(trace)}\n`)
  return true
}
