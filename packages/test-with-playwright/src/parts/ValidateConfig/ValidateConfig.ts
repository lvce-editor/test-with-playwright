import type { E2eConfig } from '../E2eConfig/E2eConfig.ts'

const optionTypes = {
  browser: 'string',
  coverage: 'boolean',
  electronArgs: 'array',
  electronCacheDir: 'string',
  electronEnv: 'array',
  electronPath: 'string',
  electronVersion: 'string',
  filter: 'string',
  headless: 'boolean',
  onlyExtension: 'string',
  reusePage: 'boolean',
  runtime: 'string',
  serverPath: 'string',
  svgScreenshotDir: 'string',
  svgScreenshotSelector: 'string',
  testPath: 'string',
  timeout: 'number',
  traceFocus: 'boolean',
  traceRendererWorker: 'boolean',
  updateSvgScreenshots: 'boolean',
} as const satisfies Record<keyof E2eConfig, string>

export const validateConfig = (value: unknown): E2eConfig => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('expected a default export containing an options object')
  }
  for (const [key, item] of Object.entries(value)) {
    if (!Object.hasOwn(optionTypes, key)) {
      throw new TypeError(`unknown config option: ${key}`)
    }
    const expected = optionTypes[key as keyof E2eConfig]
    const valid =
      expected === 'array'
        ? Array.isArray(item) && item.every((entry) => typeof entry === 'string')
        : typeof item === expected
    if (!valid) {
      const description = expected === 'array' ? 'an array of strings' : `a ${expected}`
      throw new TypeError(`expected ${key} to be ${description}`)
    }
    if (key === 'timeout' && (!Number.isFinite(item) || item <= 0)) {
      throw new TypeError('expected timeout to be a positive number')
    }
  }
  return value
}
