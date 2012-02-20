#!/bin/bash

# SBT configuration
export SBT_BOOT_DIR=${HOME}/.sbt/boot/

if [ ! -d "${SBT_BOOT_DIR}" ]; then
  mkdir -p ${SBT_BOOT_DIR}
fi

if [ -f "~/.sbtconfig" ]; then
  . ~/.sbtconfig
fi

