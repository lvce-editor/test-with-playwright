export const formatDuration = (duration: number): string => {
  const roundedDuration = Math.round(duration)
  return `${roundedDuration}ms`
}
