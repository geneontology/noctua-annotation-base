#!/bin/bash

set -e

# Define variables
USER_DATA="../go-site/metadata/users.yaml"  
GROUP_DATA="../go-site/metadata/groups.yaml"  
BARISTA_LOCATION="http://localhost:3400"  
LOGIN_SECRETS_DIR="../go-internal/barista"  
NOCTUA_CONTEXT="go"  
BARISTA_DEFAULT_NAMESPACE="minerva_public_dev"  
BARISTA_REPL_PORT=9090  

cd ../noctua
# Run the command
node barista.js \
  --debug 0 \
  --users ${USER_DATA} \
  --groups ${GROUP_DATA} \
  --self ${BARISTA_LOCATION} \
  --secrets ${LOGIN_SECRETS_DIR} \
  --context ${NOCTUA_CONTEXT} \
  --default-namespace ${BARISTA_DEFAULT_NAMESPACE} \
  --repl ${BARISTA_REPL_PORT}
