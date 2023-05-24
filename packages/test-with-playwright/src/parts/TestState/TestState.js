export const state = {
  /**
   * @type {import('@playwright/test').Page|undefined}
   */
  page: undefined,
  /**
   * @type {import('@playwright/test').Browser|undefined}
   */
  browser: undefined,
  /**
   * @type {import('child_process').ChildProcess|undefined}
   */
  childProcess: undefined,
  /**
   * @type{boolean}
   */
  runImmediately: true,
  /**
   * @type{any}
   */
  port: 0,
  root: undefined,
}
