import * as StartBrowser from '../StartBrowser/StartBrowser.js'
import * as StartServer from '../StartServer/StartServer.js'
import * as GetPort from '../GetPort/GetPort.js'
import * as GetServerPath from '../GetServerPath/GetServerPath.js'

/**
 *
 * @param {{signal:AbortSignal, headless: boolean}} options
 * @returns
 */
export const setupTests = async ({ signal, headless }) => {
  const port = await GetPort.getPort()
  const { browser, page } = await StartBrowser.startBrowser({
    signal,
    headless,
  })
  const serverPath = await GetServerPath.getServerPath()
  const child = await StartServer.startServer({ signal, port, serverPath })
  return {
    port,
    browser,
    page,
    child,
  }
}
