import { expect, test } from '@jest/globals'
import * as PatchPlaywrightFirefoxWorkerWebSocket from '../src/parts/PatchPlaywrightFirefoxWorkerWebSocket/PatchPlaywrightFirefoxWorkerWebSocket.ts'

const unpatched = `abc
      _onWebSocketOpened(event) {
        const request2 = this._webSocketRequests.get(event.requestId);
        assert(request2);
        const response2 = this._webSocketResponses.get(event.requestId);
        assert(response2);
        this._webSocketRequests.delete(event.requestId);
        this._webSocketResponses.delete(event.requestId);
        this._page.frameManager.onWebSocketRequest(webSocketId(event.frameId, event.wsid), request2.headers);
        this._page.frameManager.onWebSocketResponse(webSocketId(event.frameId, event.wsid), response2.status, response2.statusText, response2.headers);
      }
def`

const patched = `abc
      _onWebSocketOpened(event) {
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
      }
def`

test('patchCoreBundleContent patches firefox worker websocket assertion', () => {
  const result = PatchPlaywrightFirefoxWorkerWebSocket.patchCoreBundleContent(unpatched)

  expect(result).toBe(patched)
})

test('patchCoreBundleContent is idempotent', () => {
  const result = PatchPlaywrightFirefoxWorkerWebSocket.patchCoreBundleContent(patched)

  expect(result).toBe(patched)
})

test('patchCoreBundleContent throws when handler cannot be found', () => {
  expect(() => PatchPlaywrightFirefoxWorkerWebSocket.patchCoreBundleContent('abc')).toThrow(
    new Error('Could not patch Playwright Firefox worker WebSocket handler'),
  )
})
