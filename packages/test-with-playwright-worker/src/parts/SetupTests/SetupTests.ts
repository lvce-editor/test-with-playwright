import * as GetPort from '../GetPort/GetPort.ts'
import * as GetServerPath from '../GetServerPath/GetServerPath.ts'
import * as StartBrowser from '../StartBrowser/StartBrowser.ts'
import * as StartServer from '../StartServer/StartServer.ts'

/**
 *
 * @param {{signal:AbortSignal, headless: boolean, onlyExtension:string, testPath:string}} options
 * @returns
 */
export const setupTests = async ({
  headless,
  onlyExtension,
  serverPath,
  signal,
  testPath,
}: {
  readonly signal: AbortSignal
  readonly headless: boolean
  readonly onlyExtension: string
  readonly testPath: string
  readonly serverPath?: string
}): Promise<{ port: number; browser: any; page: any; child: any }> => {
  const port = await GetPort.getPort()
  const { browser, page } = await StartBrowser.startBrowser({
    headless,
    signal,
  })
  const resolvedServerPath = await GetServerPath.getServerPath(serverPath)
  const child = await StartServer.startServer({ onlyExtension, port, serverPath: resolvedServerPath, signal, testPath })
  return {
    browser,
    child,
    page,
    port,
  }
}
