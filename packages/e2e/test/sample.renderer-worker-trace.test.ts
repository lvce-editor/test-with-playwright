import { afterEach, expect, test } from '@jest/globals'
import { readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { runFixture } from '../src/_runFixture.ts'
import { root } from '../src/root.ts'

const traceDirectory = join(
  root,
  'packages',
  'e2e',
  'fixtures',
  'sample.renderer-worker-trace',
  'e2e',
  'renderer-worker-traces',
)

afterEach(async () => {
  await rm(traceDirectory, { force: true, recursive: true })
})

test.each([
  { args: [], name: 'fresh page', output: 'sample.renderer-worker-trace.json' },
  { args: ['--reuse-page'], name: 'reused page', output: '_all.json' },
])('renderer-worker tracing with $name loads tests and captures commands', async ({ args, output }): Promise<void> => {
  const result = await runFixture('sample.renderer-worker-trace', ['--trace-renderer-worker', ...args])
  expect({ exitCode: result.exitCode, stderr: result.stderr }).toMatchObject({ exitCode: 0 })
  const trace = JSON.parse(await readFile(join(traceDirectory, output), 'utf8'))
  expect(trace.version).toBe(1)
  expect(trace.entries.length).toBeGreaterThan(0)
  const command = expect.objectContaining({ method: expect.any(String) })
  expect(trace.entries).toEqual(expect.arrayContaining([command]))
  const timeline = trace.timeline.entries
  expect(timeline.some((entry: any) => entry.kind === 'input' && entry.event === 'click')).toBe(true)
  expect(timeline.some((entry: any) => entry.kind === 'dom-mutation')).toBe(true)
  expect(
    timeline.some(
      (entry: any) => entry.kind === 'rpc-received' && entry.payload.includes('TestFrameWork.performAction'),
    ),
  ).toBe(true)
  expect(
    timeline.some((entry: any) => entry.kind === 'rpc-received' && entry.payload.includes('Viewlet.setPatches')),
  ).toBe(true)
  const sequences = timeline.map((entry: any) => entry.sequence)
  expect(sequences).toEqual(sequences.toSorted((a: number, b: number) => a - b))
  expect(new Set(sequences).size).toBe(sequences.length)
})
