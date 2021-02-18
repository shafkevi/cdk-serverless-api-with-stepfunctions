#!/bin/bash

set -e
rm -rf dist
mkdir -p dist

npx tsc

rsync -azr --delete secrets/ dist/secrets/
rsync -azr --delete src/ dist/src/

