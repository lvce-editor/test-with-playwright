import type { Page } from '@playwright/test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

const selector = 'script.RendererWorkerTrace'

const getFileName = (test: string): string => {
  const name = basename(test)
  return `${name.slice(0, -extname(name).length)}.json`
}

const exportReceivedMessages = async ({
  page,
  test,
}: {
  readonly page: Page
  readonly test: string
}): Promise<void> => {
  const directory = process.env['E2E_DIAGNOSTIC_DIR']
  if (!directory) {
    return
  }
  let messages: unknown
  try {
    messages = await page.evaluate(() => {
      // @ts-expect-error Test-only renderer-process diagnostic global.
      return globalThis.___receivedMessages || []
    })
  } catch (error) {
    messages = [{ captureError: String(error) }]
  }
  await mkdir(directory, { recursive: true })
  const name = basename(test, extname(test))
  const attempt = process.env['E2E_DIAGNOSTIC_ATTEMPT'] || 'unknown'
  const path = join(directory, `allmessages-${name}-attempt-${attempt}.json`)
  await writeFile(path, `${JSON.stringify(messages, null, 2)}\n`)
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
  await exportReceivedMessages({ page, test })
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
