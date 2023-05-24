#!/bin/bash

set -e



cd ../noctua-form
git add --all
git commit -m "Fix: dev banner"
git push origin sprint-6

cd ../noctua-visual-pathway-editor
git add --all
git commit -m "Fix: dev banner"
git push origin sprint-6