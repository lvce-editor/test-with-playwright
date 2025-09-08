import * as GetOptions from '../GetOptions/GetOptions.ts'
import * as RunAllTests from '../RunAllTests/RunAllTests.ts'
import * as GetTestWorkerPath from '../GetTestWorkerPath/GetTestWorkerPath.ts'

interface HandleCliArgsParams {
  argv: string[]
  env: NodeJS.ProcessEnv
  commandMap: any
}

export const handleCliArgs = async ({ argv, env, commandMap }: HandleCliArgsParams): Promise<void> => {
  const cwd = process.cwd()
  const options = GetOptions.getOptions({ argv, env })
  const onlyExtension = options.onlyExtension
  const testPath = options.testPath
  const headless = options.headless
  const timeout = 30_000
  const testWorkerPath = GetTestWorkerPath.getTestWorkerPath()

  // TODO
  // console.log({ argv, env })
  await RunAllTests.runAllTests({
    // @ts-ignore
    onlyExtension,
    testPath,
    cwd,
    headless,
    timeout,
    commandMap,
    testWorkerPath,
  })
}
