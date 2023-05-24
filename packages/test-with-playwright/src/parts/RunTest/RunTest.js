import { performance } from 'node:perf_hooks'

export const runTest = async ({ name, fn }) => {
  const start = performance.now()
  console.info(`[test] running ${name}`)
  await fn()
  const end = performance.now()
  const duration = end - start
  console.info(`[test] passed ${name} in ${duration}ms`)
}
