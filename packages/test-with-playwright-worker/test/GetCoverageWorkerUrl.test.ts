import { expect, test } from '@jest/globals'
import { getCoverageWorkerUrl } from '../src/parts/GetCoverageWorkerUrl/GetCoverageWorkerUrl.ts'

test('returns the source worker URL during development', () => {
  const moduleUrl =
    'file:///repo/packages/test-with-playwright-worker/src/parts/GetCoverageWorkerUrl/GetCoverageWorkerUrl.ts'

  expect(getCoverageWorkerUrl(moduleUrl)).toBe(
    'file:///repo/packages/test-with-playwright-coverage-worker/src/workerMain.ts',
  )
})

test('returns the bundled worker URL in the published package', () => {
  const moduleUrl = 'file:///repo/node_modules/@lvce-editor/test-with-playwright-worker/dist/workerMain.js'

  expect(getCoverageWorkerUrl(moduleUrl)).toBe(
    'file:///repo/node_modules/@lvce-editor/test-with-playwright-worker/dist/coverageWorkerMain.js',
  )
})
