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
  let text: string | undefined
  try {
    text = await page.evaluate((traceSelector) => {
      return globalThis.document.querySelector<HTMLScriptElement>(traceSelector)?.textContent || undefined
    }, selector)
  } catch {
    return false
  }
  if (!text) {
    return false
  }
  JSON.parse(text)
  await writeFile(join(directory, getFileName(test)), `${text}\n`)
  return true
}
