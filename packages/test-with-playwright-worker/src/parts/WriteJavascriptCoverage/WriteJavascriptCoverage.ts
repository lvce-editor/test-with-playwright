import type { CoverageMap } from 'istanbul-lib-coverage'
import IstanbulReport from 'istanbul-lib-report'
import IstanbulReports from 'istanbul-reports'
import { mkdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

const executeReport = (
  coverageMap: CoverageMap,
  directory: string,
  name: Parameters<typeof IstanbulReports.create>[0],
): void => {
  const context = IstanbulReport.createContext({ coverageMap, dir: directory })
  IstanbulReports.create(name).execute(context)
}

export const writeJavascriptCoverage = async (coverageMap: CoverageMap, directory: string): Promise<void> => {
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
