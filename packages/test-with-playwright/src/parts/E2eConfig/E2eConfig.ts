export interface E2eConfig {
  browser?: 'chromium' | 'firefox' | 'webkit'
  coverage?: boolean
  electronArgs?: string[]
  electronCacheDir?: string
  electronEnv?: string[]
  electronPath?: string
  electronVersion?: string
  filter?: string
  headless?: boolean
  onlyExtension?: string
  reusePage?: boolean
  runtime?: 'browser' | 'electron'
  serverPath?: string
  svgScreenshotDir?: string
  svgScreenshotSelector?: string
  testPath?: string
  timeout?: number
  traceFocus?: boolean
  traceRendererWorker?: boolean
  updateSvgScreenshots?: boolean
}
