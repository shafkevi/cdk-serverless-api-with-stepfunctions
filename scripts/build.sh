#!/bin/bash

set -e

CWD=$(pwd -P)

mkdir -p dist/assets
mkdir -p dist/secrets

rsync -azr --delete assets/ dist/assets/
rsync -azr --delete secrets/ dist/secrets/

npx tsc
