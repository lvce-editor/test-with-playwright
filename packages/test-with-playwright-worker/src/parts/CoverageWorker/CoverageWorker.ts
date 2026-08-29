import type { Coverage } from '@playwright/test'
import { LazyNodeWorkerRpcParent } from '@lvce-editor/rpc'
import { fileURLToPath } from 'node:url'
import * as CoverageWorkerCommandType from '../CoverageWorkerCommandType/CoverageWorkerCommandType.ts'
import * as GetCoverageWorkerUrl from '../GetCoverageWorkerUrl/GetCoverageWorkerUrl.ts'

type JavascriptCoverageEntry = Awaited<ReturnType<Coverage['stopJSCoverage']>>[number]

export const writeJavascriptCoverage = async (
  entries: readonly JavascriptCoverageEntry[],
  directory: string,
): Promise<void> => {
  const rpc = LazyNodeWorkerRpcParent.create({
    commandMap: {},
    path: fileURLToPath(GetCoverageWorkerUrl.getCoverageWorkerUrl()),
    stdio: 'inherit',
  })
  try {
    await rpc.invoke(CoverageWorkerCommandType.WriteJavascriptCoverage, entries, directory)
  } finally {
    await rpc.dispose()
  }
}
