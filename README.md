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
