#!/bin/bash

INPUT_DIR=/ocr_input
OUTPUT_DIR=/ocr_output

# ocrmypdf hostname
OCRMYPDF_SERVER="ocrmypdf"

# identify parameters, input and output file
array=( "$@" )
len=${#array[@]}
ARGS=${array[@]:0:$len-2}

LAST_ARGS="${@: -2}"
INPUT_FILE_PARAM=`echo "$LAST_ARGS" | cut -d ' ' -f 1`
OUTPUT_FILE_PARAM=`echo "$LAST_ARGS" | cut -d ' ' -f 2`

# extract filenames
INPUT_FILE=$(basename "$INPUT_FILE_PARAM")
OUTPUT_FILE=$(basename "$OUTPUT_FILE_PARAM")

# SSH parameters
SCP=cp
SSH=ssh
USER=root

# copy original pdf to ocrmypdf server
$SCP $INPUT_FILE_PARAM $INPUT_DIR

# execute ocrmypdf program
$SSH $USER@$OCRMYPDF_SERVER "/usr/bin/ocr.sh $ARGS $INPUT_DIR/$INPUT_FILE $OUTPUT_DIR/$OUTPUT_FILE"

# copy transformed pdf back to alfresco path
$SCP $OUTPUT_DIR/$OUTPUT_FILE ${OUTPUT_FILE_PARAM}

# remove temporal files
rm -f $INPUT_DIR/$INPUT_FILE $OUTPUT_DIR/$OUTPUT_FILE
