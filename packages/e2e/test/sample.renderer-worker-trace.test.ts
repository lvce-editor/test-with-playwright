import { afterEach, expect, test } from '@jest/globals'
import { readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { runFixture } from '../src/_runFixture.ts'
import { root } from '../src/root.ts'

const traceDirectory = join(root, 'packages', 'e2e', 'fixtures', 'sample.hello-world', 'e2e', 'renderer-worker-traces')

afterEach(async () => {
  await rm(traceDirectory, { force: true, recursive: true })
})

test.each([
  { args: [], name: 'fresh page', output: 'sample.hello-world.json' },
  { args: ['--reuse-page'], name: 'reused page', output: '_all.json' },
])('renderer-worker tracing with $name loads tests and captures commands', async ({ args, output }): Promise<void> => {
  const result = await runFixture('sample.hello-world', ['--trace-renderer-worker', ...args])
  expect({ exitCode: result.exitCode, stderr: result.stderr }).toMatchObject({ exitCode: 0 })
  const trace = JSON.parse(await readFile(join(traceDirectory, output), 'utf8'))
  expect(trace.version).toBe(1)
  expect(trace.entries.length).toBeGreaterThan(0)
  const command = expect.objectContaining({ method: expect.any(String) })
  expect(trace.entries).toEqual(expect.arrayContaining([command]))
})
