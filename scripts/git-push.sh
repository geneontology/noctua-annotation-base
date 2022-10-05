#!/bin/bash

set -e
cd ../noctua-form
git add --all
git commit -m "added comments and landing page create section rename"
git push origin sprint-3
cd ../noctua-landing-page
git add --all
git commit -m "added comments and landing page create section rename"
git push origin sprint-3
cd ../noctua-visual-pathway-editor
git add --all
git commit -m "added comments and landing page create section rename"
git push origin sprint-3