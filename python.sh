#!/bin/sh

DIR=`dirname $0`
DIR=`realpath $DIR`

# append libs paths
export PYTHONPATH="${PYTHONPATH}:${DIR}"
python3 "$@"
