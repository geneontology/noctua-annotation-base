#!/bin/bash

set -e

noctua_repos=("../noctua-form"
"../noctua-landing-page"
"../noctua-visual-pathway-editor"
"../noctua-alliance-pathway-preview")

for str in ${noctua_repos[@]}; do
  cd $str
  git checkout dev
  git pull origin dev
done
