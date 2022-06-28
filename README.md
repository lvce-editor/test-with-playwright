# @lvce-editor/test-with-playwright

## Usage

```js
import {
  runWithExtension,
  test,
  expect,
} from '@lvce-editor/test-with-playwright'

test('sample.hello-world', async () => {
  const page = await runWithExtension({})
  const sideBar = page.locator('#SideBar')
  await expect(sideBar).toBeVisible()
})
```

## Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/lvce-editor/test-with-playwright)
