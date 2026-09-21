import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const disabledFeaturesPrefix = '--disable-features='

export const getBrowserLaunchArgs = (browser: string, platform = process.platform): string[] => {
  if (browser !== 'chromium' || platform !== 'win32') {
    return []
  }
  // SO_RANDOMIZE_PORT intermittently fails with WSAENOBUFS on Windows.
  // Read Playwright's defaults so this override preserves its other disabled features.
  const { server } = require('playwright-core/lib/coreBundle')
  const playwright = server.createPlaywright({ sdkLanguage: 'javascript' })
  const defaultArgs: readonly string[] = playwright.chromium._innerDefaultArgs({})
  const disabledFeatures = defaultArgs.find((argument) => argument.startsWith(disabledFeaturesPrefix))
  if (!disabledFeatures) {
    throw new Error('Could not find Playwright Chromium disabled features')
  }
  return [`${disabledFeatures},TcpPortRandomizationWin`]
}
