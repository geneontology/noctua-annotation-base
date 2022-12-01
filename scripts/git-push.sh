#!/bin/bash

set -e
cd ../noctua-form
git add --all
git commit -m "production build"
git push origin master
cd ../noctua-landing-page
git add --all
git commit -m "production build"
git push origin master
cd ../noctua-visual-pathway-editor
git add --all
git commit -m "production build"
git push origin master