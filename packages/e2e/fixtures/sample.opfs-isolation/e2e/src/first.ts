export const name = 'first'

export const test = async (): Promise<void> => {
  // This fixture runs in the browser worker, where OPFS is available.
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const root = await navigator.storage.getDirectory()
  const file = await root.getFileHandle('previous-scenario.txt', { create: true })
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('previous-scenario-handles', 1)
    request.onupgradeneeded = (): void => {
      request.result.createObjectStore('handles')
    }
    request.onsuccess = (): void => resolve(request.result)
    request.onerror = (): void => reject(request.error)
  })
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('handles', 'readwrite')
      transaction.objectStore('handles').put(file, 'file')
      transaction.oncomplete = (): void => resolve()
      transaction.onerror = (): void => reject(transaction.error)
      transaction.onabort = (): void => reject(transaction.error)
    })
  } finally {
    database.close()
  }
}
