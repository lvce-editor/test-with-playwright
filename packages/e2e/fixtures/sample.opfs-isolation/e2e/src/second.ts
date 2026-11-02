export const name = 'second'

export const test = async (): Promise<void> => {
  const databases = await indexedDB.databases()
  if (databases.some((database) => database.name === 'previous-scenario-handles')) {
    throw new Error('The previous scenario left its IndexedDB handles in this browser profile')
  }
  // This fixture runs in the browser worker, where OPFS is available.
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const root = await navigator.storage.getDirectory()
  try {
    await root.getFileHandle('previous-scenario.txt')
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      return
    }
    throw error
  }
  throw new Error('The previous scenario left its OPFS file in this browser profile')
}
