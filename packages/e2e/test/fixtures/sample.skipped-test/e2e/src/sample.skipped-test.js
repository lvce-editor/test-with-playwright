import {
  runWithExtension,
  test,
  expect,
} from '@lvce-editor/test-with-playwright'

test.skip('sample.skipped-test', async () => {
  const page = await runWithExtension({})
  const sideBar = page.locator('#SideBar')
  await expect(sideBar).toBeVisible()
})
