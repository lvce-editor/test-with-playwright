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
    "e2e:electron": "node ./node_modules/@lvce-editor/test-with-playwright/bin/test-with-playwright.js --electron --test-path=./e2e"
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
- `--electron`: shorthand for `--runtime=electron`; infers the Lvce release from the installed `@lvce-editor/server`
- `--only-extension`: path to the extension under test
- `--test-path`: path to the test root
- `--server-path`: explicit server entry point
- `--filter`: run only matching tests
- `--headless`: run Playwright in headless mode
- `--reuse-page`: run browser tests through `/tests/_all.html` on one page
- `--timeout`: test timeout in milliseconds, defaults to `30000` or `600000` with `--reuse-page`
- `--browser`: browser engine to launch: `chromium`, `firefox`, or `webkit`
- `--trace-focus`: add `traceFocus=true` to test URLs
- `--electron-path`: path to an existing Electron app executable
- `--electron-version`: Lvce release version override; by default Electron uses the installed `@lvce-editor/server` version
- `--electron-cache-dir`: directory for downloaded Electron apps, defaults to `.test-with-playwright/electron`
- `--electron-arg`: extra Electron app argument, can be provided multiple times
- `--electron-env`: Electron environment variable in `NAME=value` form, can be provided multiple times

## Runtime Notes

- `browser` keeps the server-backed HTML test execution flow.
- `--reuse-page` is browser-only. It loads `/tests/_all.html` once and reads JSON results from a hidden `.TestResults` element.
- `electron` downloads or reuses the matching Lvce Electron app, launches it with Playwright and a temporary user data directory, and runs each test module against the first window.
- `--electron-path` skips downloading and is useful for custom local builds.

## Reuse Page Results

When `--reuse-page` is enabled, `/tests/_all.html` should run the tests and write a JSON array into `.TestResults`:

```json
[
  {
    "name": "sample.hello-world.js",
    "status": "pass",
    "error": "",
    "start": 0,
    "end": 12.5
  }
]
```

`status` must be `pass`, `skip`, or `fail`. `error` is optional and defaults to an empty string.

## Environment Variables

- `ONLY_EXTENSION`
- `TEST_PATH`
