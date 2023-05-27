/**
 * @param {string} name
 */
export const isTestFile = (name) => {
  return !name.startsWith('_')
}
