import * as GetOptions from '../GetOptions/GetOptions.ts'
import * as GetTestWorkerUrl from '../GetTestWorkerPath/GetTestWorkerPath.ts'
import * as RunAllTests from '../RunAllTests/RunAllTests.ts'

interface HandleCliArgsParams {
  argv: string[]
  env: NodeJS.ProcessEnv
  commandMap: any
  cwd: string
}

export const handleCliArgs = async ({ argv, env, commandMap, cwd }: Readonly<HandleCliArgsParams>): Promise<void> => {
  const options = GetOptions.getOptions({ argv, env })
  const { onlyExtension, testPath, headless, serverPath } = options
  const timeout = 30_000
  const testWorkerUri = GetTestWorkerUrl.getTestWorkerUrl()

  await RunAllTests.runAllTests({
    // @ts-ignore
    onlyExtension,
    testPath,
    cwd,
    headless,
    timeout,
    commandMap,
    testWorkerUri,
    serverPath,
  })
}
