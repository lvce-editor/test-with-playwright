import { expect, jest, test } from '@jest/globals'
import { getUrlFromTestFile, navigateToTest } from '../src/parts/RunTest/RunTest.ts'

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

test('navigateToTest waits for the DOM instead of network idle', async () => {
  const goto = jest.fn(async (): Promise<void> => {})
  const page = {
    goto,
  }

  await navigateToTest(page as any, 'http://localhost:3000/tests/about.open.html')

  expect(goto).toHaveBeenCalledWith('http://localhost:3000/tests/about.open.html', {
    waitUntil: 'domcontentloaded',
  })
})
