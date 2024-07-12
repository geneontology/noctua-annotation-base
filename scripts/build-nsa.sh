#!/bin/bash

set -e
cd ../noctua-standard-annotations
rm -rf src
cp -r ../noctua-form-base/src .



rm -rf workbenches/noctua-standard-annotations/public
npm run build