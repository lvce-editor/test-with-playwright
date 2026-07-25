#!/bin/bash

set -e

cd $(dirname "$0")
cd ..

command_exists(){
  command -v "$1" &> /dev/null
}

if ! command_exists "ncu"; then
    echo "npm-check-updates is not installed"
    npm i -g npm-check-updates
else
    echo "ncu is installed"
fi

function updateDependencies {
  echo "updating dependencies..."
  ncu -u -x @babel/preset-typescript -x typescript
}

                                                       updateDependencies &&
cd packages/e2e                                     && updateDependencies && cd ../.. &&
cd packages/build                                   && updateDependencies && cd ../.. &&
cd packages/server                                  && updateDependencies && cd ../.. &&
cd packages/test-with-playwright                    && updateDependencies && cd ../.. &&
cd packages/test-with-playwright-worker             && updateDependencies && cd ../.. &&

npm install

echo "Great Success!"

sleep 2
