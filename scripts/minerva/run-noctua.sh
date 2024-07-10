#!/bin/bash

# Define variables
GOLR_LOOKUP_URL="http://golr-aux.geneontology.io/solr/"  # Value from the configuration
GOLR_NEO_LOOKUP_URL="http://noctua-golr.berkeleybop.org/"  # Value from the configuration
BARISTA_LOOKUP_URL="http://localhost:3400"  # Value from the configuration
NOCTUA_CONTEXT="go"  # Value from the configuration
NOCTUA_LOOKUP_URL="http://localhost:8910"  # Value from the configuration
NOCTUA_LOCATION="http://localhost:8910"  # Value from the configuration
DEF_APP_DEF="minerva_local"  # Value from the configuration
WORKBENCH_DIRS=(
  "../noctua-form/workbenches"
  "../noctua-standard-annotations/workbenches"
  "../noctua-landing-page/workbenches"
  "../noctua-alliance-pathway-preview/workbenches"
  "../noctua-form-legacy/workbenches"
  "../noctua-visual-pathway-editor/workbenches"
  "workbenches"
)
COLLAPSIBLE_RELATIONS=(
  "RO:0002233"
  "RO:0002234"
  "RO:0002333"
  "RO:0002488"
  "BFO:0000066"
  "BFO:0000051"
)
COLLAPSIBLE_REVERSE_RELATIONS=()  # Value from the configuration
EXTERNAL_BROWSER_LOCATION="http://tomodachi.berkeleybop.org/amigo/search/model_annotation"  # Value from the configuration
USE_GITHUB=false  # Set to true if GitHub integration is configured
GITHUB_API="api.github.com"
GITHUB_ORG="geneontology"
GITHUB_REPO="noctua-models"

# Convert arrays to strings
WORKBENCH_DIRS_STR=$(IFS=, ; echo "${WORKBENCH_DIRS[*]}")
COLLAPSIBLE_RELATIONS_STR=$(IFS=, ; echo "${COLLAPSIBLE_RELATIONS[*]}")
COLLAPSIBLE_REVERSE_RELATIONS_STR=$(IFS=, ; echo "${COLLAPSIBLE_REVERSE_RELATIONS[*]}")

cd ../tmp-models

# Build the command
CMD=(
  "node noctua.js"
  "--golr ${GOLR_LOOKUP_URL}"
  "--golr-neo ${GOLR_NEO_LOOKUP_URL}"
  "--barista ${BARISTA_LOOKUP_URL}"
  "--noctua-context ${NOCTUA_CONTEXT}"
  "--noctua-public ${NOCTUA_LOOKUP_URL}"
  "--noctua-self ${NOCTUA_LOCATION}"
  "--minerva-definition ${DEF_APP_DEF}"
  "--workbenches \"${WORKBENCH_DIRS_STR}\""
)

if [ -n "${COLLAPSIBLE_RELATIONS_STR}" ]; then
  CMD+=("--collapsible-relations \"${COLLAPSIBLE_RELATIONS_STR}\"")
fi

if [ -n "${COLLAPSIBLE_REVERSE_RELATIONS_STR}" ]; then
  CMD+=("--collapsible-reverse-relations \"${COLLAPSIBLE_REVERSE_RELATIONS_STR}\"")
fi

if [ -n "${EXTERNAL_BROWSER_LOCATION}" ]; then
  CMD+=("--external-browser-location \"${EXTERNAL_BROWSER_LOCATION}\"")
fi

if [ "${USE_GITHUB}" = true ]; then
  CMD+=("--github-api ${GITHUB_API}")
  CMD+=("--github-org ${GITHUB_ORG}")
  CMD+=("--github-repo ${GITHUB_REPO}")
fi

# Run the command
echo "Running Noctua with the following command:"
echo "${CMD[@]}"
eval "${CMD[@]}"
