import { chromium } from '@playwright/test'
import assert from 'node:assert'
import * as TestState from '../TestState/TestState.js'

export const startBrowser = async ({ headless = false }) => {
  assert(!TestState.state.browser, 'Browser should not be defined')
  console.info('START BROWSER')
  const browser = await chromium.launch({
    headless,
  })
  TestState.state.browser = browser
  const page = await browser.newPage({})
  TestState.state.page = page
  return page
}
