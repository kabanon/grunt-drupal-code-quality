#!/bin/sh
#
# To enable this hook copy it into .git/hooks and rename it pre-commit :
# cp scripts/code-quality/code-quality-pre-commit-hook.sh .git/hooks/pre-commit



# Base variables.
EXIT_CODE=0
INSTALL_DIR=`readlink -f $0 | xargs dirname`

# Binaries.
GRUNT_BIN=`command -v grunt`

# Load project environment variables.
. $INSTALL_DIR/env.cfg



# Begin Grunt hook
$GRUNT_BIN --base PROJECT_DIR --gruntfile $INSTALL_DIR/Gruntfile.js
EXIT_CODE=$((${EXIT_CODE} + $?))



# Errors
if [ $EXIT_CODE -ne 0 ]
then
    echo ""
    echo "Problems were found"
    echo "Commit aborted."
fi

exit ${EXIT_CODE}
