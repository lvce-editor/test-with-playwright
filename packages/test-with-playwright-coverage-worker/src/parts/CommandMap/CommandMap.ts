import * as CoverageWorkerCommandType from '../CoverageWorkerCommandType/CoverageWorkerCommandType.ts'
import * as WriteJavascriptCoverage from '../WriteJavascriptCoverage/WriteJavascriptCoverage.ts'

export const commandMap = {
  [CoverageWorkerCommandType.WriteJavascriptCoverage]: WriteJavascriptCoverage.writeJavascriptCoverage,
}
