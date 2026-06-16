import { execFile as execFileCallback } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFileCallback)

export const execFile = async ({
  args,
  command,
}: {
  readonly args: readonly string[]
  readonly command: string
}): Promise<void> => {
  await execFileAsync(command, [...args], {
    windowsHide: true,
  })
}
