#!/bin/bash

set -e

CWD=$(pwd -P)

mkdir -p dist/secrets
mkdir -p dist/assets

rsync -azr --delete secrets/ dist/secrets/
rsync -azr --delete assets/ dist/assets/

npx tsc
