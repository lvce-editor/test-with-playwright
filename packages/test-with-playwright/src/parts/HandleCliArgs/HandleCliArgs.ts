import * as GetHelpMessage from '../GetHelpMessage/GetHelpMessage.ts'
import * as GetOptions from '../GetOptions/GetOptions.ts'
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
  const { browser, filter, headless, help, onlyExtension, serverPath, testPath, traceFocus } = options
  if (help) {
    console.info(GetHelpMessage.getHelpMessage())
    return
  }
  const timeout = 30_000
  const testWorkerUri = GetTestWorkerUrl.getTestWorkerUrl()

  await RunAllTests.runAllTests({
    browser,
    commandMap,
    cwd,
    filter,
    headless,
    // @ts-ignore
    onlyExtension,
    serverPath,
    testPath,
    testWorkerUri,
    timeout,
    traceFocus,
  })
}
