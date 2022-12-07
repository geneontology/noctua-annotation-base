#!/bin/bash

set -e
cd ../noctua-form
git add --all
git commit -m "added the extension for menu after updating the menu"

cd ../noctua-landing-page
git add --all
git commit -m "added the extension for menu after updating the menu"

cd ../noctua-visual-pathway-editor
git add --all
git commit -m "added the extension for menu after updating the menu"
