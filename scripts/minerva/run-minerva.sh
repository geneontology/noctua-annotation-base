#!/bin/bash

set -e 

cd ../tmp-models
java -Xmx8G -cp ../minerva/minerva-cli/bin/minerva-cli.jar org.geneontology.minerva.server.StartUpTool \
  --use-golr-url-logging \
  --use-request-logging \
  --arachne \
  -g go-lego-reacto.owl \
  --port 6800 \
  --ontojournal blazegraph-go-lego-reacto-neo.jnl \
  -f blazegraph.jnl \
  --gpad-shex ../go-internal/shapes/gpad-shapes.shex \
  --gpad-shape-map ../go-internal/shapes/gpad-shapes.shapeMap \
  --golr-labels http://noctua-golr.berkeleybop.org \
  --golr-seed http://golr-aux.geneontology.io/solr \
  --skip-class-id-validation
