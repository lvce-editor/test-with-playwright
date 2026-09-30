import type { Coverage } from '@playwright/test'
import { LazyNodeWorkerRpcParent } from '@lvce-editor/rpc'
import { fileURLToPath } from 'node:url'
import type { JavascriptCoverageEntry as WorkerJavascriptCoverageEntry } from '../WorkerJavascriptCoverage/WorkerJavascriptCoverage.ts'
import * as CoverageWorkerCommandType from '../CoverageWorkerCommandType/CoverageWorkerCommandType.ts'
import * as GetCoverageWorkerUrl from '../GetCoverageWorkerUrl/GetCoverageWorkerUrl.ts'

type JavascriptCoverageEntry = Awaited<ReturnType<Coverage['stopJSCoverage']>>[number] | WorkerJavascriptCoverageEntry

export const writeJavascriptCoverage = async (
  entries: readonly JavascriptCoverageEntry[],
  directory: string,
  threshold?: number,
  include?: string,
): Promise<void> => {
  const rpc = LazyNodeWorkerRpcParent.create({
    commandMap: {},
    path: fileURLToPath(GetCoverageWorkerUrl.getCoverageWorkerUrl()),
    stdio: 'inherit',
  })
  try {
    await rpc.invoke(CoverageWorkerCommandType.WriteJavascriptCoverage, entries, directory, threshold, include)
  } finally {
    await rpc.dispose()
  }
}
