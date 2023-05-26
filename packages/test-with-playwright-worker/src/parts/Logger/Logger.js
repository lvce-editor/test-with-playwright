// TODO mock this module when used in unit tests

const state = {
  /**
   * @type {Console|undefined}
   */
  console: undefined,
}

const createConsole = () => {
  return console
}

const getOrCreateLogger = () => {
  if (!state.console) {
    state.console = createConsole()
  }
  return state.console
}

export const log = (...args) => {
  const logger = getOrCreateLogger()
  logger.log(...args)
  console.log(...args)
}

export const info = (...args) => {
  const logger = getOrCreateLogger()
  logger.info(...args)
  console.info(...args)
}

export const warn = (...args) => {
  const logger = getOrCreateLogger()
  logger.warn(...args)
  console.warn(...args)
}

export const error = (...args) => {
  const logger = getOrCreateLogger()
  logger.error(...args)
  console.error(...args)
}
