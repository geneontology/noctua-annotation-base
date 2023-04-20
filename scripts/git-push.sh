#!/bin/bash

set -e


cd ../noctua-visual-pathway-editor
git add --all
git commit -m "delete casual edge not supported"
git push origin sprint-5
