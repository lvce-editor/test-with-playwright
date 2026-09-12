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

## Configuration

Create `e2e.config.js` with a default options object. `defineConfig` is optional and provides editor completion and type checking:

```js
import { defineConfig } from '@lvce-editor/test-with-playwright'

export default defineConfig({
  onlyExtension: '../extension',
  testPath: '.',
  serverPath: '../../node_modules/@lvce-editor/server/bin/server.js',
  reusePage: true,
})
```

The runner searches the current directory and its parents, using the nearest `e2e.config.js`. Paths in the config resolve relative to that file. CLI and environment paths remain relative to the working directory. Without a config file, existing CLI usage works as before.

All test options below are supported with camelCase names (`onlyExtension`, `testPath`, `traceRendererWorker`, etc.). Use `runtime: 'electron'` for `--electron`, and string arrays for `electronArgs` and `electronEnv`. `help` is CLI-only. The `E2eConfig` type is also exported for JSDoc or TypeScript annotations.

Precedence, from lowest to highest: built-in defaults, config, environment variables, explicit CLI arguments. CLI arrays replace configured arrays. Use `--no-headless` (or `--headless=false`) to override `headless: true`; the same applies to other boolean test options.

```json
{
  "scripts": {
    "e2e": "test-with-playwright",
    "e2e:headless": "test-with-playwright --headless"
  }
}
```

`npm run e2e -- --headless` also loads the config and overrides only `headless`.

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
- `--coverage`: collect JavaScript coverage with Chromium and write Istanbul reports to `coverage`
- `--trace-focus`: add `traceFocus=true` to test URLs
- `--trace-renderer-worker`: save renderer-worker command traces in `renderer-worker-traces/`
- `--svg-screenshot-dir`: compare a self-contained SVG screenshot after each passing test with the browser-specific snapshot in this directory
- `--svg-screenshot-selector`: capture only the first matching element, such as `.Explorer`; defaults to the application body
- `--update-svg-screenshots`: create or update SVG screenshots in `--svg-screenshot-dir`
- `--electron-path`: path to an existing Electron app executable
- `--electron-version`: Lvce release version override; by default Electron uses the installed `@lvce-editor/server` version
- `--electron-cache-dir`: directory for downloaded Electron apps, defaults to `.test-with-playwright/electron`
- `--electron-arg`: extra Electron app argument, can be provided multiple times
- `--electron-env`: Electron environment variable in `NAME=value` form, can be provided multiple times

## Runtime Notes

- `browser` keeps the server-backed HTML test execution flow.
- JavaScript coverage is available for Chromium-based browser and Electron runs. It prints a coverage table and writes `coverage/coverage-final.json`, `coverage/coverage-summary.json`, `coverage/coverage.txt`, and `coverage/lcov.info`.
- `--reuse-page` is browser-only. It loads `/tests/_all.html` once and reads JSON results from a hidden `.TestResults` element.
- `electron` downloads or reuses the matching Lvce Electron app, launches it with Playwright and a temporary user data directory, and runs each test module against the first window.
- Electron isolates `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_CACHE_HOME` and `XDG_STATE_HOME` beneath its temporary profile, overriding inherited values and `--electron-env` for these paths. The actual home directory is preserved. Profiles are removed after shutdown, including failed or cancelled launches.
- `--electron-path` skips downloading and is useful for custom local builds.
- SVG screenshots are not supported with `--reuse-page`, because that mode exposes only the final application state.

## Renderer Worker Traces

Use a server runtime containing the traced-test URL fix (`@lvce-editor/server` 0.115.5 or newer):

```sh
npm run e2e -- --headless --trace-renderer-worker
npm run e2e -- --headless --reuse-page --trace-renderer-worker
```

Fresh-page runs write one JSON file per test; reused-page runs write `_all.json`. Each file contains an ordered `entries` array of renderer-worker commands with timestamps, directions and parameters. Check that the array is nonempty and includes the scenario's commands before relying on a capture. Save needed traces before starting another trace-enabled run, which clears the output directory.

## SVG Screenshot Tests

Add `--svg-screenshot-dir=./snapshots` to compare each passing test's final application state with a committed SVG. Use `--svg-screenshot-selector=.Explorer` for a focused Explorer View snapshot. Snapshot names include the runtime, for example `viewlet.explorer-open.chromium.svg`, so browser-specific output does not conflict.

Create or intentionally update the snapshots with:

```sh
npm run e2e -- --svg-screenshot-dir=./snapshots --update-svg-screenshots
```

The screenshot converts the rendered DOM to SVG shapes with the computed visual properties already applied. Fonts and images are inlined, test result overlays are excluded, animations and carets are frozen, and no page scripts are included. A mismatch writes an adjacent `.actual` file for inspection and fails the test.

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
