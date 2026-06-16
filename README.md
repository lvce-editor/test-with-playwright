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
    "e2e:electron": "node ./node_modules/@lvce-editor/test-with-playwright/bin/test-with-playwright.js --runtime=electron --electron-version=v0.84.0 --test-path=./e2e"
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
- `--browser`: browser engine to launch, either `chromium` or `firefox`
- `--trace-focus`: add `traceFocus=true` to test URLs
- `--electron-path`: path to an existing Electron app executable
- `--electron-version`: Lvce release version to download, required for `--runtime=electron` when `--electron-path` is not provided
- `--electron-cache-dir`: directory for downloaded Electron apps, defaults to `.test-with-playwright/electron`
- `--electron-arg`: extra Electron app argument, can be provided multiple times
- `--electron-env`: Electron environment variable in `NAME=value` form, can be provided multiple times

## Runtime Notes

- `browser` keeps the server-backed HTML test execution flow.
- `electron` downloads or reuses a Lvce Electron app, launches it with Playwright, and runs each test module against the first window.
- `--electron-path` skips downloading and is useful for custom local builds.

## Environment Variables

- `ONLY_EXTENSION`
- `TEST_PATH`
