import { expect, test } from '@jest/globals'
import { getUrlFromTestFile } from '../src/parts/RunTest/RunTest.ts'

test('getUrlFromTestFile enables renderer worker tracing', () => {
  expect(getUrlFromTestFile('viewlet.explorer-open.js', 3000, false, true)).toBe(
    'http://localhost:3000/tests/viewlet.explorer-open.html?traceRendererWorker=true',
  )
})

test('getUrlFromTestFile combines tracing options', () => {
  expect(getUrlFromTestFile('viewlet.explorer-open.js', 3000, true, true)).toBe(
    'http://localhost:3000/tests/viewlet.explorer-open.html?traceFocus=true&traceRendererWorker=true',
  )
})
