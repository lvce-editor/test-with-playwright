import * as GetPort from '../GetPort/GetPort.js'
import * as LaunchServer from '../LaunchServer/LaunchServer.js'
import * as StartBrowser from '../StartBrowser/StartBrowser.js'
import * as TestState from '../TestState/TestState.js'
import * as Process from '../Process/Process.js'

export const startAll = async (env) => {
  const port = await GetPort.getPort()
  await LaunchServer.launchServer({
    port,
    env,
    folder: '',
  })
  TestState.state.port = port
  const headless = Process.argv.includes('--headless')
  const page = await StartBrowser.startBrowser({ headless })
  return { page, port }
}
