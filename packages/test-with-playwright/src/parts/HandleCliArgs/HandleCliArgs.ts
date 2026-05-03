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
    electronArgs,
    electronCwd,
    electronEntry,
    electronEnv,
    electronPath,
    filter,
    headless,
    onlyExtension,
    runtime,
    serverPath,
    testPath,
    traceFocus,
  } = options
  const timeout = 30_000
  const testWorkerUri = GetTestWorkerUrl.getTestWorkerUrl()
  const runtimeOptions = GetRuntimeOptions.getRuntimeOptions({
    cwd,
    ...(electronArgs ? { electronArgs } : {}),
    ...(electronCwd ? { electronCwd } : {}),
    ...(electronEntry ? { electronEntry } : {}),
    ...(electronEnv ? { electronEnv } : {}),
    ...(electronPath ? { electronPath } : {}),
    ...(runtime ? { runtime } : {}),
    ...(serverPath ? { serverPath } : {}),
  })

  await RunAllTests.runAllTests({
    commandMap,
    cwd,
    filter,
    headless,
    // @ts-ignore
    onlyExtension,
    runtimeOptions,
    testPath,
    testWorkerUri,
    timeout,
    traceFocus,
  })
}
