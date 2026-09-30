import { expect, test } from '@jest/globals'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as WriteJavascriptCoverage from '../src/parts/WriteJavascriptCoverage/WriteJavascriptCoverage.ts'

const entry = {
  functions: [
    {
      functionName: 'workerMain',
      isBlockCoverage: false,
      ranges: [{ count: 1, endOffset: 17, startOffset: 0 }],
    },
  ],
  scriptId: '1',
  source: 'const value = 1;\n',
  url: 'file:///tmp/aboutWorkerMain.js',
}

test('writes the report and fails when worker line coverage misses its threshold', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'worker-coverage-'))
  try {
    await expect(
      WriteJavascriptCoverage.writeJavascriptCoverage(
        [{ ...entry, functions: [{ ...entry.functions[0], ranges: [{ count: 0, endOffset: 17, startOffset: 0 }] }] }],
        directory,
        100,
      ),
    ).rejects.toThrow('worker line coverage 0% is below threshold 100%')
    expect(await readFile(join(directory, 'coverage-summary.json'), 'utf8')).toContain('"pct":0')
  } finally {
    await rm(directory, { force: true, recursive: true })
  }
})

test('writes included files and passes a satisfied line threshold', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'worker-coverage-'))
  try {
    await expect(
      WriteJavascriptCoverage.writeJavascriptCoverage([entry], directory, 100, '/tmp/'),
    ).resolves.toBeUndefined()
    expect(await readFile(join(directory, 'coverage-summary.json'), 'utf8')).toContain('aboutWorkerMain.js')
  } finally {
    await rm(directory, { force: true, recursive: true })
  }
})

test('fails when the source filter matches no files', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'worker-coverage-'))
  try {
    await expect(
      WriteJavascriptCoverage.writeJavascriptCoverage([entry], directory, undefined, '/not-in-path/'),
    ).rejects.toThrow('worker coverage target produced no files matching /not-in-path/')
  } finally {
    await rm(directory, { force: true, recursive: true })
  }
})

test('fails when a threshold is configured but no coverage files exist', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'worker-coverage-'))
  try {
    await expect(WriteJavascriptCoverage.writeJavascriptCoverage([], directory, 90)).rejects.toThrow(
      'worker coverage target produced no reportable JavaScript',
    )
  } finally {
    await rm(directory, { force: true, recursive: true })
  }
})

test('writes unfiltered reports when no threshold is requested', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'worker-coverage-'))
  try {
    await expect(WriteJavascriptCoverage.writeJavascriptCoverage([entry], directory)).resolves.toBeUndefined()
    expect(await readFile(join(directory, 'coverage-summary.json'), 'utf8')).toContain('aboutWorkerMain.js')
  } finally {
    await rm(directory, { force: true, recursive: true })
  }
})
