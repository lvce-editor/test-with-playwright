import { resolve } from 'node:path'
import * as GetHelpMessage from '../GetHelpMessage/GetHelpMessage.ts'
import * as GetOptions from '../GetOptions/GetOptions.ts'
import * as GetRuntimeOptions from '../GetRuntimeOptions/GetRuntimeOptions.ts'
import * as GetTestWorkerUrl from '../GetTestWorkerPath/GetTestWorkerPath.ts'
import * as LoadConfig from '../LoadConfig/LoadConfig.ts'
import * as ParseCliArgs from '../ParseCliArgs/ParseCliArgs.ts'
import * as RunAllTests from '../RunAllTests/RunAllTests.ts'

interface HandleCliArgsParams {
  argv: string[]
  commandMap: any
  cwd: string
  env: NodeJS.ProcessEnv
}

export const handleCliArgs = async ({ argv, commandMap, cwd, env }: Readonly<HandleCliArgsParams>): Promise<void> => {
  if (ParseCliArgs.parseCliArgs(argv).help) {
    console.info(GetHelpMessage.getHelpMessage())
    return
  }
  const config = await LoadConfig.loadConfig(cwd)
  const options = GetOptions.getOptions({ argv, config, env })
  const {
    browser,
    coverage,
    electronArgs,
    electronCacheDir,
    electronEnv,
    electronPath,
    electronVersion,
    filter,
    headless,
    onlyExtension,
    reusePage,
    runtime,
    serverPath,
    svgScreenshotDir,
    svgScreenshotSelector,
    testPath,
    timeout,
    traceFocus,
    traceRendererWorker,
    updateSvgScreenshots,
  } = options
  const testWorkerUri = GetTestWorkerUrl.getTestWorkerUrl()
  const runtimeOptions = await GetRuntimeOptions.getRuntimeOptions({
    cwd,
    ...(electronArgs && { electronArgs }),
    ...(electronCacheDir && { electronCacheDir }),
    ...(electronEnv && { electronEnv }),
    ...(electronPath && { electronPath }),
    ...(electronVersion && { electronVersion }),
    runtime,
    ...(serverPath && { serverPath }),
  })

  await RunAllTests.runAllTests({
    browser,
    commandMap,
    coverage,
    cwd,
    filter,
    headless,
    onlyExtension,
    reusePage,
    runtimeOptions,
    ...(svgScreenshotDir && {
      svgScreenshotOptions: {
        directory: resolve(cwd, svgScreenshotDir),
        name: runtime === 'electron' ? 'electron' : browser,
        ...(svgScreenshotSelector && { selector: svgScreenshotSelector }),
        update: updateSvgScreenshots,
      },
    }),
    testPath,
    testWorkerUri,
    timeout,
    traceFocus,
    traceRendererWorker,
  })
}
