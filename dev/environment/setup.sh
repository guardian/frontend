#!/bin/bash

ENVIRONMENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"


# Install software
. ${ENVIRONMENT_DIR}/install-play2-release.sh


# SBT configuration
export SBT_BOOT_DIR=${HOME}/.sbt/boot/

if [ ! -d "${SBT_BOOT_DIR}" ]; then
  mkdir -p ${SBT_BOOT_DIR}
fi

if [ -f "~/.sbtconfig" ]; then
  . ~/.sbtconfig
fi

