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

const getCoverageOptions = ({
  coverageInclude,
  coverageTarget,
  coverageThreshold,
}: {
  readonly coverageInclude?: string | undefined
  readonly coverageTarget?: string | undefined
  readonly coverageThreshold?: number | undefined
}): { coverageInclude?: string; coverageTarget?: string; coverageThreshold?: number } => {
  const options: { coverageInclude?: string; coverageTarget?: string; coverageThreshold?: number } = {}
  if (coverageInclude) {
    options.coverageInclude = coverageInclude
  }
  if (coverageTarget) {
    options.coverageTarget = coverageTarget
  }
  if (coverageThreshold !== undefined) {
    options.coverageThreshold = coverageThreshold
  }
  return options
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
    coverageInclude,
    coverageTarget,
    coverageThreshold,
    electronArgs,
    electronCacheDir,
    electronEnv,
    electronPath,
    electronVersion,
    filter,
    headless,
    link,
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
    ...(link && link.length > 0 && { link }),
    ...(serverPath && { serverPath }),
  })

  await RunAllTests.runAllTests({
    browser,
    commandMap,
    coverage,
    ...getCoverageOptions({ coverageInclude, coverageTarget, coverageThreshold }),
    cwd,
    ...(filter !== undefined && { filter }),
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
    ...(traceFocus !== undefined && { traceFocus }),
    traceRendererWorker,
  })
}
