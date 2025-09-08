import * as GetOptions from '../GetOptions/GetOptions.ts'
import * as GetTestWorkerPath from '../GetTestWorkerPath/GetTestWorkerPath.ts'
import * as RunAllTests from '../RunAllTests/RunAllTests.ts'

interface HandleCliArgsParams {
  argv: string[]
  env: NodeJS.ProcessEnv
  commandMap: any
  cwd: string
}

export const handleCliArgs = async ({ argv, env, commandMap, cwd }: Readonly<HandleCliArgsParams>): Promise<void> => {
  const options = GetOptions.getOptions({ argv, env })
  const {onlyExtension} = options
  const {testPath} = options
  const {headless} = options
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
