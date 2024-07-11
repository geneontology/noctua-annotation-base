#!/bin/bash

MINERVA_MAX_MEM=12  
NOCTUA_STORE="../tmp-models/blazegraph-2.jnl"  
NOCTUA_MODELS="../tmp-models/noctua-models/models/"  
MINERVA_JAR="../minerva/minerva-cli/bin/minerva-cli.jar" 

java -Xmx${MINERVA_MAX_MEM}G -jar ${MINERVA_JAR} --import-owl-models -j ${NOCTUA_STORE} -f ${NOCTUA_MODELS}