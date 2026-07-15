import type { Coverage } from '@playwright/test'
import IstanbulCoverage, { type CoverageMap, type CoverageMapData } from 'istanbul-lib-coverage'
import v8ToIstanbul from 'v8-to-istanbul'

export type JavascriptCoverageEntry = Awaited<ReturnType<Coverage['stopJSCoverage']>>[number]

const externalSourceMapCommentRegex =
  /(?:\/\/[#@]\s*sourceMappingURL=(?!data:).*?$|\/\*[#@]\s*sourceMappingURL=(?!data:).*?\*\/)/gm
const temporaryServerRootRegex = /^\/[a-f\d]{7,}(?=\/(?:js|packages)\/)/

export const normalizeCoveragePath = (path: string): string => {
  return path.replace(temporaryServerRootRegex, '')
}

const normalizeCoverageData = (coverageData: CoverageMapData): CoverageMapData => {
  const normalized: CoverageMapData = Object.create(null)
  for (const data of Object.values(coverageData)) {
    const path = normalizeCoveragePath(data.path)
    normalized[path] = {
      ...data,
      path,
    }
  }
  return normalized
}

const getCoveragePath = (url: string): string => {
  try {
    return decodeURIComponent(new URL(url).pathname)
  } catch {
    return url
  }
}

const isTestScript = (url: string): boolean => {
  try {
    return new URL(url).pathname.startsWith('/tests/')
  } catch {
    return false
  }
}

const addEntryToCoverageMap = async (coverageMap: CoverageMap, entry: JavascriptCoverageEntry): Promise<void> => {
  if (!entry.source || !entry.url || isTestScript(entry.url)) {
    return
  }
  const source = entry.source.replaceAll(externalSourceMapCommentRegex, '')
  const converter = v8ToIstanbul(getCoveragePath(entry.url), 0, { source })
  await converter.load()
  converter.applyCoverage(entry.functions)
  coverageMap.merge(normalizeCoverageData(converter.toIstanbul()))
}

export const createJavascriptCoverage = async (entries: readonly JavascriptCoverageEntry[]): Promise<CoverageMap> => {
  const coverageMap = IstanbulCoverage.createCoverageMap()
  for (const entry of entries) {
    await addEntryToCoverageMap(coverageMap, entry)
  }
  return coverageMap
}
