export const argv = process.argv

export const env = process.env

/**
 *
 * @param {number} code
 */
export const exit = (code) => {
  process.exit(code)
}

/**
 *
 * @param {string} event
 * @param {any} listener
 */
export const on = (event, listener) => {
  process.on(event, listener)
}
