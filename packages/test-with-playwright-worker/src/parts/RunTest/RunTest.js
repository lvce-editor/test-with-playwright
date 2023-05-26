import { join } from 'path'

export const runTest = async ({ test, page, testSrc, port }) => {
  const url = `http://localhost:${port}`
  // const url = `http://example.com`
  await page.goto(url, {
    waitUntil: 'networkidle',
  })
  const absolutePath = join(testSrc, test)
}
