#!/bin/bash

ENVIRONMENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PLAY_VERSION="2.0-RC2"
PLAY_FILE="play-${PLAY_VERSION}.zip"
PLAY_DOWNLOAD_URL="http://download.playframework.org/releases/${PLAY_FILE}"

pushd ${ENVIRONMENT_DIR} > /dev/null

PLAY_HOME=${ENVIRONMENT_DIR}/$(basename ${PLAY_FILE} .zip)

if [ ! -e ${PLAY_FILE} ]; then
    echo " "
    echo " "
    echo " "
    echo "--------------------------------------------------------------------------------"
    echo "Downloading Play Framework - this should only happen on first run"
    echo "${PLAY_DOWNLOAD_URL}"
    echo "Please wait"
    echo "--------------------------------------------------------------------------------"
    echo " "
    echo " "
    echo " "
    curl ${PLAY_DOWNLOAD_URL} > ${PLAY_FILE}
    echo " "
    echo " "
    echo "PLAY_HOME set to ${PLAY_HOME}"
fi

if [ -e ${PLAY_FILE} -a ! -e ${PLAY_HOME} ]; then
    unzip ${PLAY_FILE}
fi

export PLAY_HOME

popd > /dev/null
