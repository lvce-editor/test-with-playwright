import { expect, test } from '@jest/globals'

const source = new URL('../../test-with-playwright-worker/src/parts/StartBrowser/StartBrowser.ts', import.meta.url)
const { startBrowser } = await import(source.href)
const browser = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'

test('dedicated workers can open and synchronously read OPFS files', async () => {
  const controller = new AbortController()
  const launch = await startBrowser({ browser, headless: true, signal: controller.signal })
  try {
    await launch.page.route('http://localhost/opfs', async (route: any) => {
      await route.fulfill({ body: '<html></html>', contentType: 'text/html' })
    })
    await launch.page.goto('http://localhost/opfs')
    const result = await launch.page.evaluate(async () => {
      const script = `
        (async () => {
          const root = await navigator.storage.getDirectory();
          const file = await root.getFileHandle('cache', { create: true });
          const handle = await file.createSyncAccessHandle();
          try {
            handle.write(new TextEncoder().encode('cached content'), { at: 0 });
            handle.flush();
            const bytes = new Uint8Array(handle.getSize());
            handle.read(bytes, { at: 0 });
            postMessage(new TextDecoder().decode(bytes));
          } finally {
            handle.close();
          }
        })().catch(error => postMessage(String(error)));
      `
      const url = URL.createObjectURL(new Blob([script], { type: 'text/javascript' }))
      const worker = new Worker(url)
      try {
        return await new Promise<string>((resolve, reject) => {
          worker.onmessage = (event): void => resolve(event.data)
          worker.onerror = (event): void => reject(new Error(event.message))
        })
      } finally {
        worker.terminate()
        URL.revokeObjectURL(url)
      }
    })
    expect(result).toBe('cached content')
  } finally {
    await launch.dispose()
    controller.abort()
  }
})
