import { expect, test } from '@jest/globals'
import * as GetHelpMessage from '../src/parts/GetHelpMessage/GetHelpMessage.ts'

test('getHelpMessage', () => {
  expect(GetHelpMessage.getHelpMessage()).toContain('Usage: test-with-playwright [options]')
  expect(GetHelpMessage.getHelpMessage()).toContain('-h, --help')
  expect(GetHelpMessage.getHelpMessage()).toContain('--reuse-page')
})
