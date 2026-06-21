import type { Page } from '@playwright/test'
import * as TestState from '../TestState/TestState.ts'

interface TestResult {
  readonly end: number
  readonly error: string
  readonly name: string
  readonly start: number
  readonly status: number
}

const testResultsSelector = '.TestResults'

const getResultCounts = (status: number): { failed: number; passed: number; skipped: number } => {
  switch (status) {
    case TestState.Fail:
      return { failed: 1, passed: 0, skipped: 0 }
    case TestState.Pass:
      return { failed: 0, passed: 1, skipped: 0 }
    case TestState.Skip:
      return { failed: 0, passed: 0, skipped: 1 }
    default:
      return { failed: 0, passed: 0, skipped: 0 }
  }
}

const getAllTestsUrl = (port: number, filter: string | undefined, traceFocus: boolean): string => {
  const url = new URL(`http://localhost:${port}/tests/_all.html`)
  if (traceFocus) {
    url.searchParams.set('traceFocus', 'true')
  }
  if (filter) {
    url.searchParams.set('filter', filter)
  }
  return url.href
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const parseStatus = (value: unknown): number => {
  switch (value) {
    case 'fail':
      return TestState.Fail
    case 'pass':
      return TestState.Pass
    case 'skip':
      return TestState.Skip
    default:
      throw new Error(`expected status to be pass, skip, or fail`)
  }
}

const parseString = (value: unknown, field: string): string => {
  if (typeof value !== 'string') {
    throw new TypeError(`expected ${field} to be a string`)
  }
  return value
}

const parseOptionalString = (value: unknown, field: string): string => {
  if (value === undefined) {
    return ''
  }
  return parseString(value, field)
}

const parseNumber = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`expected ${field} to be a finite number`)
  }
  return value
}

const parseTestResult = (value: unknown): TestResult => {
  if (!isObject(value)) {
    throw new TypeError(`expected test result to be an object`)
  }
  return {
    end: parseNumber(value.end, 'end'),
    error: parseOptionalString(value.error, 'error'),
    name: parseString(value.name, 'name'),
    start: parseNumber(value.start, 'start'),
    status: parseStatus(value.status),
  }
}

const parseTestResults = (text: string): readonly TestResult[] => {
  const parsed = JSON.parse(text) as unknown
  if (!Array.isArray(parsed)) {
    throw new TypeError(`expected TestResults JSON to be an array`)
  }
  return parsed.map(parseTestResult)
}

const getFailedAllTestsResult = (error: unknown, start: number): TestResult => {
  const message = error instanceof Error ? error.message : String(error)
  return {
    end: performance.now(),
    error: message,
    name: '_all.html',
    start,
    status: TestState.Fail,
  }
}

const readTestResultsText = async (page: Page, timeout: number): Promise<string> => {
  const testResults = page.locator(testResultsSelector)
  await testResults.waitFor({
    state: 'attached',
    timeout,
  })
  await page.waitForFunction(
    (selector) => {
      const element = document.querySelector(selector)
      const text = element?.textContent
      return typeof text === 'string' && text.trim().length > 0
    },
    testResultsSelector,
    {
      timeout,
    },
  )
  const text = await testResults.textContent()
  if (!text || text.trim().length === 0) {
    throw new Error(`TestResults is empty`)
  }
  return text
}

export const runTestsWithReusedPage = async ({
  filter,
  onFinalResult,
  onResult,
  page,
  port,
  timeout,
  traceFocus,
}: {
  readonly filter?: string
  readonly onFinalResult: (result: any) => Promise<void>
  readonly onResult: (result: any) => Promise<void>
  readonly page: Page
  readonly port: number
  readonly timeout: number
  readonly traceFocus?: boolean
}): Promise<void> => {
  const start = performance.now()
  let results: readonly TestResult[]
  try {
    const url = getAllTestsUrl(port, filter, traceFocus ?? false)
    await page.goto(url, {
      waitUntil: 'networkidle',
    })
    const text = await readTestResultsText(page, timeout)
    results = parseTestResults(text)
  } catch (error) {
    results = [getFailedAllTestsResult(error, start)]
  }
  let failed = 0
  let passed = 0
  let skipped = 0
  for (const result of results) {
    await onResult(result)
    const resultCounts = getResultCounts(result.status)
    failed += resultCounts.failed
    passed += resultCounts.passed
    skipped += resultCounts.skipped
  }
  const end = performance.now()
  await onFinalResult({
    end,
    failed,
    passed,
    skipped,
    start,
  })
}
