# @lvce-editor/test-with-playwright

## Usage

```json
{
  "scripts": {
    "e2e": "node ./node_modules/@lvce-editor/test-with-playwright/bin/test-with-playwright.js --only-extension=. --test-path=./e2e"
  }
}
```

```js
test('sample.hello-world', async () => {
  const sideBar = Locator('#SideBar')
  await expect(sideBar).toBeVisible()
})
```

## CLI Flags

- `--only-extension`: path to the extension under test
- `--test-path`: path to the test root
- `--server-path`: explicit server entry point
- `--filter`: run only matching tests
- `--headless`: run Playwright in headless mode
- `--trace-focus`: add `traceFocus=true` to test URLs

## Environment Variables

- `ONLY_EXTENSION`
- `TEST_PATH`
