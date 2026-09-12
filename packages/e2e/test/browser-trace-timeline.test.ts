import { expect, test } from '@jest/globals'
import { chromium, firefox, webkit } from '@playwright/test'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { root } from '../src/root.ts'

// Load the browser installer without adding a TypeScript project reference cycle.
const source = join(root, 'packages/test-with-playwright-worker/src/parts/BrowserTraceTimeline/BrowserTraceTimeline.ts')
const { install } = await import(pathToFileURL(source).href)
const browsers = { chromium, firefox, webkit }
const browserName = (process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium') as keyof typeof browsers

test('timeline preserves native message ports and bounds retained events', async () => {
  const browser = await browsers[browserName].launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.addInitScript(install)
    await page.goto('data:text/html,<button>Trace fixture</button>')
    const result = await page.evaluate(async () => {
      const { port1, port2 } = new MessageChannel()
      const message = { bigint: 42n, buffer: new ArrayBuffer(4), self: null as any, text: 'x'.repeat(9000) }
      message.self = message
      const received = new Promise<any>((resolve) => {
        port2.onmessage = (event): void => resolve(event.data)
      })
      const returned = port1.postMessage(message, [message.buffer])
      const data = await received
      const snapshot = (globalThis as any).__lvceTraceTimeline()
      let failedPostThrows = false
      try {
        port1.postMessage(() => {})
      } catch {
        failedPostThrows = true
      }
      const count = 5100
      const delivered = new Promise<number>((resolve) => {
        let total = 0
        port2.onmessage = null
        port2.addEventListener('message', (): void => {
          if (++total === count) resolve(total)
        })
        port2.start()
      })
      for (let index = 0; index < count; index++) port1.postMessage(index)
      const total = await delivered
      const bounded = (globalThis as any).__lvceTraceTimeline()
      port1.close()
      port2.close()
      return {
        bounded,
        detached: message.buffer.byteLength === 0,
        failedPostThrows,
        preserved:
          data.self === data && data.bigint === 42n && data.text.length === 9000 && data.buffer.byteLength === 4,
        returnedUndefined: returned === undefined,
        snapshot,
        total,
      }
    })
    expect(result).toMatchObject({
      detached: true,
      failedPostThrows: true,
      preserved: true,
      returnedUndefined: true,
      total: 5100,
    })
    expect(result.snapshot.entries.some((entry: any) => entry.kind === 'rpc-sent' && entry.truncated)).toBe(true)
    expect(result.bounded.entries).toHaveLength(5000)
    expect(result.bounded.dropped).toBeGreaterThan(0)
    const sequences = result.bounded.entries.map((entry: any) => entry.sequence)
    expect(sequences).toEqual(sequences.toSorted((a: number, b: number) => a - b))
    expect(new Set(sequences).size).toBe(sequences.length)
  } finally {
    await browser.close()
  }
})
