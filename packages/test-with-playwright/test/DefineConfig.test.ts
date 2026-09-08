import { expect, test } from '@jest/globals'
import { defineConfig } from '../src/api.ts'

test('defineConfig returns typed options without starting the CLI', () => {
  expect(defineConfig({ browser: 'firefox', headless: true })).toEqual({ browser: 'firefox', headless: true })
})

test('defineConfig rejects invalid options during type checking', () => {
  // @ts-expect-error unsupported browser
  defineConfig({ browser: 'invalid' })
  // @ts-expect-error unknown config option
  defineConfig({ typo: true })
  // @ts-expect-error headless must be a boolean
  defineConfig({ headless: 'true' })
  expect(defineConfig({})).toEqual({})
})
