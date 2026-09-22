import { expect, test } from '@jest/globals'

const source = new URL('../../test-with-playwright-worker/src/parts/StartBrowser/StartBrowser.ts', import.meta.url)
const { startBrowser } = await import(source.href)
const browserName = process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] || 'chromium'
const roundTripHandle = async (): Promise<string> => {
  // This callback runs in Chromium, where navigator.storage is a browser API.
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const root = await navigator.storage.getDirectory()
  const folder = await root.getDirectoryHandle('dropped-folder', { create: true })
  const file = await folder.getFileHandle('inside.txt', { create: true })
  const writable = await file.createWritable()
  await writable.write('persisted content')
  await writable.close()
  // This helper is serialized with the browser callback and cannot live in the Node scope.
  const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
    new Promise((resolve, reject) => {
      request.onsuccess = (): void => resolve(request.result)
      request.onerror = (): void => reject(request.error)
    })
  const request = indexedDB.open('handles', 1)
  request.onupgradeneeded = (): void => {
    request.result.createObjectStore('handles')
  }
  const database = await requestToPromise(request)
  try {
    await requestToPromise(database.transaction('handles', 'readwrite').objectStore('handles').put(folder, 'folder'))
    const restored: FileSystemDirectoryHandle = await requestToPromise(
      database.transaction('handles').objectStore('handles').get('folder'),
    )
    const restoredFile = await restored.getFileHandle('inside.txt')
    const fileContent = await restoredFile.getFile()
    return fileContent.text()
  } finally {
    database.close()
  }
}

if (browserName === 'chromium') {
  test('Chromium round-trips filesystem handles through IndexedDB', async () => {
    const controller = new AbortController()
    const launch = await startBrowser({ browser: 'chromium', headless: true, signal: controller.signal })
    try {
      await launch.page.route('http://localhost/handles', async (route: any) => {
        await route.fulfill({ body: '<html></html>', contentType: 'text/html' })
      })
      await launch.page.goto('http://localhost/handles')
      const content = await launch.page.evaluate(roundTripHandle)
      expect(content).toBe('persisted content')
    } finally {
      await launch.dispose()
      controller.abort()
    }
  })
} else {
  test.todo('Chromium IndexedDB handle regression')
}
