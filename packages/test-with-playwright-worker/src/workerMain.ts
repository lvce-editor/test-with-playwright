import * as PatchPlaywrightFirefoxWorkerWebSocket from './parts/PatchPlaywrightFirefoxWorkerWebSocket/PatchPlaywrightFirefoxWorkerWebSocket.ts'

if (process.argv.includes('--browser=firefox')) {
  await PatchPlaywrightFirefoxWorkerWebSocket.patchPlaywrightFirefoxWorkerWebSocket()
}

const Main = await import('./parts/Main/Main.ts')

await Main.main()
