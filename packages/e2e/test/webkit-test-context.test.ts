import { expect, test } from '@jest/globals'
import { webkit } from '@playwright/test'
import { createServer } from 'node:http'

const workerSource = new URL('../../test-with-playwright-worker/src/parts/', import.meta.url)
const RunTests = await import(new URL('RunTests/RunTests.ts', workerSource).href)

if (process.env['TEST_WITH_PLAYWRIGHT_BROWSER'] !== 'webkit') {
  test.skip('WebKit context isolation requires WebKit', () => {})
} else {
  test('WebKit test contexts isolate storage and release workers before the next test', async () => {
    const server = createServer((request, response) => {
      if (request.url === '/worker.js') {
        response.setHeader('Content-Type', 'text/javascript')
        response.end('setInterval(() => postMessage("alive"), 10)')
        return
      }
      response.setHeader('Content-Type', 'text/html')
      response.end(`<script>
      const clean = localStorage.getItem('previous-test') === null;
      localStorage.setItem('previous-test', 'present');
      const worker = new Worker('/worker.js');
      worker.onmessage = () => {
        if (document.querySelector('#TestOverlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'TestOverlay';
        overlay.dataset.state = clean ? 'pass' : 'fail';
        overlay.textContent = clean ? 'ok' : 'previous test storage leaked';
        document.body.append(overlay);
      };
    </script>`)
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    let browser
    try {
      browser = await webkit.launch({ headless: true })
      const page = await browser.newPage()
      const address = server.address()
      if (!address || typeof address === 'string') {
        throw new Error('Missing test server port')
      }
      const summaries: any[] = []
      const contextsAfterTest: number[] = []
      await RunTests.runTests({
        headless: true,
        onFinalResult: async (result: any) => {
          summaries.push(result)
        },
        onResult: async () => {
          contextsAfterTest.push(browser!.contexts().length)
        },
        page,
        port: address.port,
        tests: ['first.js', 'second.js', 'third.js'],
        testSrc: '',
        timeout: 5000,
      })
      expect(summaries).toEqual([expect.objectContaining({ failed: 0, passed: 3, skipped: 0 })])
      expect(contextsAfterTest).toEqual([1, 1, 1])
    } finally {
      await browser?.close()
      server.closeAllConnections()
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
    }
  })
}
