# @lvce-editor/test-with-playwright

## Usage

```json
{
  "scripts": {
    "e2e": "node ./node_modules/@lvce-editor/test-with-playwright/bin/test-with-playwright.js --runtime=browser --only-extension=. --test-path=./e2e"
  }
}
```

```json
{
  "scripts": {
    "e2e:electron": "node ./node_modules/@lvce-editor/test-with-playwright/bin/test-with-playwright.js --runtime=electron --test-path=./e2e --electron-path=./node_modules/electron/dist/electron --electron-cwd=../app --electron-entry=. --electron-env=DEV=1"
  }
}
```

```js
test('sample.hello-world', async () => {
  const sideBar = Locator('.SideBar')
  await expect(sideBar).toBeVisible()
})
```

## CLI Flags

- `--runtime`: `browser` (default) or `electron`
- `--only-extension`: path to the extension under test
- `--test-path`: path to the test root
- `--server-path`: explicit server entry point
- `--filter`: run only matching tests
- `--headless`: run Playwright in headless mode
- `--trace-focus`: add `traceFocus=true` to test URLs
- `--electron-path`: explicit Electron executable path
- `--electron-cwd`: working directory for the Electron app
- `--electron-entry`: Electron entry argument passed as the first application argument, defaults to `.`
- `--electron-arg`: extra Electron application argument, can be provided multiple times
- `--electron-env`: Electron environment variable in `NAME=value` form, can be provided multiple times

## Runtime Notes

- `browser` keeps the existing server-backed HTML test execution flow.
- `electron` launches a prepared Electron app and runs each test module directly against the first Playwright window.
- Electron app preparation is currently out of scope for this package. The target app must already be built and launchable with the provided cwd, entry, executable path, and environment.

## Environment Variables

- `ONLY_EXTENSION`
- `TEST_PATH`
