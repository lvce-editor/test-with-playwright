import * as GetPort from '../GetPort/GetPort.ts'
import * as GetServerPath from '../GetServerPath/GetServerPath.ts'
import * as StartBrowser from '../StartBrowser/StartBrowser.ts'
import * as StartServer from '../StartServer/StartServer.ts'

/**
 *
 * @param {{signal:AbortSignal, headless: boolean, onlyExtension:string, testPath:string}} options
 * @returns
 */
export const setupTests = async ({ signal, headless, onlyExtension, testPath }): Promise<void> => {
  const port = await GetPort.getPort()
  // @ts-ignore
  const { browser, page } = await StartBrowser.startBrowser({
    signal,
    headless,
  })
  const serverPath = await GetServerPath.getServerPath()
  const child = await StartServer.startServer({ signal, port, serverPath, onlyExtension, testPath })
  // @ts-ignore
  return {
    port,
    browser,
    page,
    child,
  }
}
