import type { CoverageMap } from 'istanbul-lib-coverage'
import IstanbulReport from 'istanbul-lib-report'
import IstanbulReports from 'istanbul-reports'
import { mkdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import type { JavascriptCoverageEntry } from '../JavascriptCoverageEntry/JavascriptCoverageEntry.ts'
import * as CreateJavascriptCoverage from '../CreateJavascriptCoverage/CreateJavascriptCoverage.ts'

const executeReport = (
  coverageMap: CoverageMap,
  directory: string,
  name: Parameters<typeof IstanbulReports.create>[0],
): void => {
  const context = IstanbulReport.createContext({ coverageMap, dir: directory })
  IstanbulReports.create(name).execute(context)
}

export const writeJavascriptCoverage = async (
  entries: readonly JavascriptCoverageEntry[],
  directory: string,
): Promise<void> => {
  const coverageMap = await CreateJavascriptCoverage.createJavascriptCoverage(entries)
  await rm(directory, { force: true, recursive: true })
  await mkdir(directory, { recursive: true })
  executeReport(coverageMap, directory, 'json')
  executeReport(coverageMap, directory, 'json-summary')
  executeReport(coverageMap, directory, 'lcovonly')
  const context = IstanbulReport.createContext({ coverageMap, dir: directory })
  IstanbulReports.create('text', { file: 'coverage.txt' }).execute(context)
  const summaryText = await readFile(join(directory, 'coverage.txt'), 'utf8')
  const summary = summaryText.trimEnd()
  console.info(`[test-with-playwright] JavaScript coverage written to ${directory}\n${summary}`)
}
