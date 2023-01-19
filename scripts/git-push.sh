#!/bin/bash

set -e


cd ../noctua-visual-pathway-editor
git checkout -b sprint-5
git add --all
git commit -m "added the decision tree for vpe"
git push origin sprint-5
