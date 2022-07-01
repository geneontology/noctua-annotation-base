#!/bin/bash

cd ../noctua-form
rm -rf src
cp -r ../noctua-form-base/src .

ignoreFiles=("src/app/layout/components/toolbar/toolbar.component.html"
"src/app/main/apps/noctua-form/noctua-form.module.ts"
"src/app/main/apps/noctua-search/noctua-search.module.ts"
"src/app/main/apps/noctua-graph/noctua-graph.module.ts")

for str in ${ignoreFiles[@]}; do
   git checkout $str
done

rm -rf workbenches/noctua-form/public
npm run build