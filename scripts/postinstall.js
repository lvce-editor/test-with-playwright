import { execa } from 'execa'
import { readdir } from 'fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const exec = async (command, args, options) => {
  console.info(command)
  await execa(command, args, {
    shell: true,
    stdio: 'inherit',
    ...options,
  })
}

const main = async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const root = join(__dirname, '..')
  const fixturePath = join(root, 'packages', 'e2e', 'test', 'fixtures')
  const fixtureNames = await readdir(fixturePath)
  for (const fixtureName of fixtureNames) {
    await exec('npm ci', ['--ignore-scripts'], {
      cwd: join(fixturePath, fixtureName, 'e2e'),
    })
  }
}

main()
