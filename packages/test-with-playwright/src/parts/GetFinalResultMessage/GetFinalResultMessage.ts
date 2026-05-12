import { formatDuration } from '../FormatDuration/FormatDuration.ts'

const getCountMessage = (count: number, singular: string, plural: string): string => {
  if (count === 1) {
    return `1 ${singular}`
  }
  return `${count} ${plural}`
}

export const getFinalResultMessage = (passed: number, skipped: number, failed: number, duration: number): string => {
  if (passed === 0 && skipped === 0 && failed === 0) {
    return `no tests found`
  }
  const formattedDuration = formatDuration(duration)
  const parts: string[] = []
  if (passed > 0) {
    parts.push(getCountMessage(passed, 'test passed', 'tests passed'))
  }
  if (skipped > 0) {
    parts.push(getCountMessage(skipped, 'test skipped', 'tests skipped'))
  }
  if (failed > 0) {
    parts.push(getCountMessage(failed, 'test failed', 'tests failed'))
  }
  return `${parts.join(', ')} in ${formattedDuration}`
}
