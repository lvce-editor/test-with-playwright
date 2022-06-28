import { execa } from 'execa'

const exec = async (command) => {
  console.info(command)
  await execa(command, {
    shell: true,
    stdio: 'inherit',
  })
}

// prettier-ignore
const main = async ()=>{
  await exec(`cd test/fixtures/sample.completion-provider/e2e && npm ci --ignore-scripts && cd ../../../../`);
  await exec(`cd test/fixtures/sample.hello-world/e2e && npm ci --ignore-scripts && cd ../../../../`);
}

main()
