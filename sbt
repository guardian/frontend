#!/bin/bash

set -o errexit


if [ -f "~/.sbtconfig" ]; then
  . ~/.sbtconfig
fi


# SBT configuration
export SBT_BOOT_DIR=${HOME}/.sbt/boot/

if [ ! -d "${SBT_BOOT_DIR}" ]; then
  mkdir -p ${SBT_BOOT_DIR}
fi


# Build configuration
BUILD_PARAMS=""
if [ -n "$BUILD_NUMBER" ]; then
  BUILD_PARAMS="${BUILD_PARAMS} -Dbuild.number=\"$BUILD_NUMBER\""
fi 
if [ -n "$BUILD_VCS_NUMBER" ]; then
  BUILD_PARAMS="${BUILD_PARAMS} -Dbuild.vcs.number=\"$BUILD_VCS_NUMBER\""
fi 


# Ivy configuration params and debug option
IVY_PARAMS=""
DEBUG_PARAMS=""
for arg in "$@"
do
    if [ "$arg" == "--directory-ivy-cache" ]; then
      echo "setting ivy cache dir"
      IVY_PARAMS="-Dsbt.ivy.home=.ivy -Divy.home=.ivy"
      shift
    fi

    if [ "$arg" == "--debug" ]; then
      echo "setting java process as debuggable"
      DEBUG_PARAMS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=1044"
      shift
    fi

done

#MaxPermSize specifies the the maximum size for the permanent generation heap,
# a heap that holds objects such as classes and methods. Xmx is the heap size.

java -Xmx6144M -XX:MaxPermSize=3072m \
  -XX:ReservedCodeCacheSize=128m \
  -XX:+UseConcMarkSweepGC \
  -XX:+CMSIncrementalMode \
  -Dsbt.boot.directory=$SBT_BOOT_DIR \
  -Djava.awt.headless=true \
  $DEBUG_PARAMS \
  -DAPP_SECRET="myKV8HQkjcaxygbDuyneHBeyFgsyyM8yCFFOxyDoT0QGuyrY7IyammSyP1VivCxS" \
  $BUILD_PARAMS \
  $IVY_PARAMS \
  $SBT_EXTRA_PARAMS \
  -jar `dirname $0`/dev/sbt-launch-0.13.0.jar "$@"
