export const getCoverageWorkerUrl = (): string => {
  return import.meta.resolve('@lvce-editor/test-with-playwright-coverage-worker')
}
