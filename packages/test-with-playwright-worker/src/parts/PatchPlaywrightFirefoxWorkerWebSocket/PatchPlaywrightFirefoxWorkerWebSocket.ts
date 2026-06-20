import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)

const before = `      _onWebSocketOpened(event) {
        const request2 = this._webSocketRequests.get(event.requestId);
        assert(request2);
        const response2 = this._webSocketResponses.get(event.requestId);
        assert(response2);
        this._webSocketRequests.delete(event.requestId);
        this._webSocketResponses.delete(event.requestId);
        this._page.frameManager.onWebSocketRequest(webSocketId(event.frameId, event.wsid), request2.headers);
        this._page.frameManager.onWebSocketResponse(webSocketId(event.frameId, event.wsid), response2.status, response2.statusText, response2.headers);
      }`

const after = `      _onWebSocketOpened(event) {
        const request2 = this._webSocketRequests.get(event.requestId);
        const response2 = this._webSocketResponses.get(event.requestId);
        if (!request2 || !response2) {
          this._webSocketRequests.delete(event.requestId);
          this._webSocketResponses.delete(event.requestId);
          return;
        }
        this._webSocketRequests.delete(event.requestId);
        this._webSocketResponses.delete(event.requestId);
        this._page.frameManager.onWebSocketRequest(webSocketId(event.frameId, event.wsid), request2.headers);
        this._page.frameManager.onWebSocketResponse(webSocketId(event.frameId, event.wsid), response2.status, response2.statusText, response2.headers);
      }`

export const patchCoreBundleContent = (content: string): string => {
  if (content.includes(after)) {
    return content
  }
  if (!content.includes(before)) {
    throw new Error('Could not patch Playwright Firefox worker WebSocket handler')
  }
  return content.split(before).join(after)
}

const getCoreBundlePath = (): string => {
  const packageJsonPath = require.resolve('playwright-core/package.json')
  return join(dirname(packageJsonPath), 'lib', 'coreBundle.js')
}

export const patchPlaywrightFirefoxWorkerWebSocket = async (): Promise<void> => {
  const file = getCoreBundlePath()
  const content = await readFile(file, 'utf8')
  const patched = patchCoreBundleContent(content)
  if (patched === content) {
    return
  }
  await writeFile(file, patched)
}
