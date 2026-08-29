import type { Profiler } from 'node:inspector'

export interface JavascriptCoverageEntry {
  readonly functions: readonly Profiler.FunctionCoverage[]
  readonly scriptId: string
  readonly source?: string
  readonly url: string
}
