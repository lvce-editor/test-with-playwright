import { resolve } from 'node:path'
import * as GetHelpMessage from '../GetHelpMessage/GetHelpMessage.ts'
import * as GetOptions from '../GetOptions/GetOptions.ts'
import * as GetRuntimeOptions from '../GetRuntimeOptions/GetRuntimeOptions.ts'
import * as GetTestWorkerUrl from '../GetTestWorkerPath/GetTestWorkerPath.ts'
import * as RunAllTests from '../RunAllTests/RunAllTests.ts'

interface HandleCliArgsParams {
  argv: string[]
  commandMap: any
  cwd: string
  env: NodeJS.ProcessEnv
}

export const handleCliArgs = async ({ argv, commandMap, cwd, env }: Readonly<HandleCliArgsParams>): Promise<void> => {
  const options = GetOptions.getOptions({ argv, env })
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
    help,
    onlyExtension,
    reusePage,
    runtime,
    serverPath,
    svgScreenshotDir,
    svgScreenshotSelector,
    testPath,
    timeout,
    traceFocus,
    updateSvgScreenshots,
  } = options
  if (help) {
    console.info(GetHelpMessage.getHelpMessage())
    return
  }
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
    // @ts-ignore
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
  })
}
