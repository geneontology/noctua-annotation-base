#!/bin/bash

set -e
cd ../noctua-alliance-pathway-preview
rm -rf src
cp -r ../noctua-form-base/src .

ignoreFiles=(
#"src/app/layout/components/toolbar/toolbar.component.html"
#"src/app/main/apps/noctua-form/noctua-form.module.ts"
#"src/app/main/apps/noctua-annotations/noctua-annotations.module.ts"
#"src/app/main/apps/noctua-search/noctua-search.module.ts"
#"src/app/main/apps/noctua-graph/noctua-graph.module.ts"
#"src/environments/environment.ts"
#"src/environments/environment.prod.ts"
#"src/environments/environment.beta-test.ts")
)
for str in ${ignoreFiles[@]}; do
   git checkout $str
done

rm -rf workbenches/noctua-alliance-pathway-preview/public
#npm run build