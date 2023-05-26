import * as HandleCliArgs from '../HandleCliArgs/HandleCliArgs.js'
import * as Process from '../Process/Process.js'

export const main = () => {
  HandleCliArgs.handleCliArgs({ argv: Process.argv, env: Process.env })
}

main()
