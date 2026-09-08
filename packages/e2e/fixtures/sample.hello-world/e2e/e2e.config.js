import { defineConfig } from '../../../../../dist/test-with-playwright/dist/api.js'

export default defineConfig({
  headless: false,
  onlyExtension: '../extension',
  serverPath: '../../../../../node_modules/@lvce-editor/server/src/server.js',
  testPath: '.',
})
