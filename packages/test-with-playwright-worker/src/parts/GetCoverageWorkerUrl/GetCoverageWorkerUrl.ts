export const getCoverageWorkerUrl = (moduleUrl: string = import.meta.url): string => {
  if (moduleUrl.endsWith('/dist/workerMain.js')) {
    return new URL('coverageWorkerMain.js', moduleUrl).href
  }
  return new URL('../../../../test-with-playwright-coverage-worker/src/workerMain.ts', moduleUrl).href
}
