/**
 *
 * @param {string} event
 * @param {any} listener
 */
export const on = (event, listener) => {
  process.on(event, listener)
}
