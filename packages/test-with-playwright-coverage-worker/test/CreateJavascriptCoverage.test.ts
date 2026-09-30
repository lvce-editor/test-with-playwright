import { expect, jest, test } from '@jest/globals'
import * as CreateJavascriptCoverage from '../src/parts/CreateJavascriptCoverage/CreateJavascriptCoverage.ts'

const source = `function used() {
  return 1
}
function unused() {
  return 2
}
used()
`

const createEntry = (url: string): CreateJavascriptCoverage.JavascriptCoverageEntry => {
  return {
    functions: [
      {
        functionName: '',
        isBlockCoverage: true,
        ranges: [{ count: 1, endOffset: source.length, startOffset: 0 }],
      },
      {
        functionName: 'used',
        isBlockCoverage: true,
        ranges: [{ count: 1, endOffset: 30, startOffset: 0 }],
      },
      {
        functionName: 'unused',
        isBlockCoverage: true,
        ranges: [{ count: 0, endOffset: 65, startOffset: 31 }],
      },
    ],
    scriptId: '1',
    source,
    url,
  }
}

test('createJavascriptCoverage converts Playwright coverage to Istanbul coverage', async () => {
  const coverageMap = await CreateJavascriptCoverage.createJavascriptCoverage([
    createEntry('http://localhost:3000/src/example.js'),
  ])

  expect(coverageMap.files()).toEqual(['/src/example.js'])
  const summary = coverageMap.getCoverageSummary()
  expect(summary.lines.total).toBeGreaterThan(0)
  expect(summary.lines.covered).toBeLessThan(summary.lines.total)
  expect(summary.functions.total).toBe(2)
  expect(summary.functions.covered).toBe(1)
})

test('createJavascriptCoverage excludes test scripts', async () => {
  const coverageMap = await CreateJavascriptCoverage.createJavascriptCoverage([
    createEntry('http://localhost:3000/tests/example.js'),
  ])

  expect(coverageMap.files()).toEqual([])
})

test('createJavascriptCoverage fetches external source maps and reports original sources', async () => {
  const sourceMap = {
    file: 'aboutWorkerMain.js',
    mappings: 'AAAA;AACA;AACA;AACA;AACA;AACA;AACA',
    names: [],
    sources: ['../../../packages/about-view/src/example.ts'],
    sourcesContent: [source],
    version: 3,
  }
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    json: async () => sourceMap,
    ok: true,
  } as Response)
  try {
    const coverageMap = await CreateJavascriptCoverage.createJavascriptCoverage([
      {
        ...createEntry('http://localhost:3000/0b98511/.tmp/dist/dist/aboutWorkerMain.js'),
        source: `${source}\n//# sourceMappingURL=aboutWorkerMain.js.map`,
      },
    ])

    expect(fetchMock).toHaveBeenCalledWith(
      new URL('http://localhost:3000/0b98511/.tmp/dist/dist/aboutWorkerMain.js.map'),
    )
    expect(coverageMap.files()).toEqual(['/packages/about-view/src/example.ts'])
  } finally {
    fetchMock.mockRestore()
  }
})

test('createJavascriptCoverage fails when an external source map cannot be fetched', async () => {
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 404 } as Response)
  try {
    await expect(
      CreateJavascriptCoverage.createJavascriptCoverage([
        {
          ...createEntry('http://localhost:3000/src/example.js'),
          source: `${source}\n//# sourceMappingURL=example.js.map`,
        },
      ]),
    ).rejects.toThrow('failed to fetch worker source map example.js.map: 404')
  } finally {
    fetchMock.mockRestore()
  }
})

test('normalizeCoveragePath removes the temporary server root', () => {
  expect(CreateJavascriptCoverage.normalizeCoveragePath('/0b98511/packages/renderer-process/dist/main.js')).toBe(
    '/packages/renderer-process/dist/main.js',
  )
  expect(CreateJavascriptCoverage.normalizeCoveragePath('/src/example.js')).toBe('/src/example.js')
})
