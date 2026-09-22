import * as GetPort from '../GetPort/GetPort.ts'
import * as GetServerPath from '../GetServerPath/GetServerPath.ts'
import * as StartBrowser from '../StartBrowser/StartBrowser.ts'
import * as StartServer from '../StartServer/StartServer.ts'

/**
 *
 * @param {{browser:'chromium'|'firefox'|'webkit', signal:AbortSignal, headless: boolean, onlyExtension:string, testPath:string}} options
 * @returns
 */
export const setupTests = async ({
  browser,
  headless,
  link,
  onlyExtension,
  serverPath,
  signal,
  testPath,
}: {
  readonly browser: 'chromium' | 'firefox' | 'webkit'
  readonly signal: AbortSignal
  readonly headless: boolean
  readonly link?: readonly string[]
  readonly onlyExtension: string
  readonly testPath: string
  readonly serverPath?: string
}): Promise<{ port: number; browser: any; page: any; child: any; dispose: () => Promise<void> }> => {
  const port = await GetPort.getPort()
  const {
    browser: browserInstance,
    dispose,
    page,
  } = await StartBrowser.startBrowser({
    browser,
    headless,
    signal,
  })
  try {
    const resolvedServerPath = await GetServerPath.getServerPath(serverPath)
    const child = await StartServer.startServer({
      ...(link && link.length > 0 && { link }),
      onlyExtension,
      port,
      serverPath: resolvedServerPath,
      signal,
      testPath,
    })
    return {
      browser: browserInstance,
      child,
      dispose,
      page,
      port,
    }
  } catch (error) {
    await dispose()
    throw error
  }
}
