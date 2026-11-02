export const name = 'first'

const openDatabase = async (name: string): Promise<IDBDatabase> => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, 1)
    request.onupgradeneeded = (): void => {
      request.result.createObjectStore('handles')
    }
    request.onsuccess = (): void => resolve(request.result)
    request.onerror = (): void => reject(request.error)
  })
}

const store = async (name: string, value: unknown): Promise<void> => {
  const database = await openDatabase(name)
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('handles', 'readwrite')
      transaction.oncomplete = (): void => resolve()
      transaction.onerror = (): void => reject(transaction.error)
      transaction.onabort = (): void => reject(transaction.error)
      transaction.objectStore('handles').put(value, 'file')
    })
  } finally {
    database.close()
  }
}

export const test = async (): Promise<void> => {
  // The marker deliberately survives until the next scenario to prove profile reuse.
  await store('shared-profile-marker', true)
  // This fixture runs in the browser worker, where OPFS is available.
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const root = await navigator.storage.getDirectory()
  try {
    const file = await root.getFileHandle('previous-scenario.txt', { create: true })
    await store('previous-scenario-handles', file)
    throw new Error('intentional assertion failure before OPFS teardown')
  } finally {
    try {
      await root.removeEntry('previous-scenario.txt')
    } finally {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase('previous-scenario-handles')
        request.onsuccess = (): void => resolve()
        request.onerror = (): void => reject(request.error)
        request.onblocked = (): void => reject(new Error('OPFS handle database cleanup was blocked'))
      })
    }
  }
}
