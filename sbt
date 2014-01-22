#!/bin/bash

set -o errexit

#Node package management for Grunt build steps

bundle install --system
npm install

NPM_EXIT=$?

if [ $NPM_EXIT == "1" ]; then
   exit 1
fi

# do an initial grunt compile - mute output and background it.
grunt compile > /dev/null &

if [ -f "~/.sbtconfig" ]; then
  . ~/.sbtconfig
fi


# SBT configuration
export SBT_BOOT_DIR=${HOME}/.sbt/boot/

if [ ! -d "${SBT_BOOT_DIR}" ]; then
  mkdir -p ${SBT_BOOT_DIR}
fi

# Debug option
DEBUG_PARAMS=""
for arg in "$@"
do

    if [ "$arg" == "--debug" ]; then
      echo "setting java process as debuggable"
      DEBUG_PARAMS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=1044"
      shift
    fi

done

# gives physical memory in KB

os=$(uname)

if [ "$os" == "Darwin" ]; then
    physical_mem="8388608"
else
    physical_mem=$(grep MemTotal /proc/meminfo | awk '{print $2}')
fi

#http://stackoverflow.com/questions/5374455/what-does-java-option-xmx-stand-for
jvm_mem="-Xmx$((physical_mem / 2 / 1024))m"

#http://stackoverflow.com/questions/12114174/what-does-xxmaxpermsize-do
perm_size="-XX:MaxPermSize=$((physical_mem / 3 / 1024))m"

if [ -z $FRONTEND_JVM_ARGS ]; then
    FRONTEND_JVM_ARGS="$jvm_mem $perm_size -XX:ReservedCodeCacheSize=128m -XX:+UseConcMarkSweepGC -XX:+CMSIncrementalMode -Djava.awt.headless=true"
fi

echo ''
echo "******************************** USING JVM ARGS ********************************"
echo $FRONTEND_JVM_ARGS
echo "*** to override/customise use export FRONTEND_JVM_ARGS='XXX' in e.g. .bashrc ***"
echo ''

echo ''
echo "********************************* JAVA VERSION *********************************"
java -version
echo "********************************************************************************"
echo ''


# NOTE this is not a REAL APP_SECRET it is just for DEV environments
fake_secret="myKV8HQkjcaxygbDuyneHBeyFgsyyM8yCFFOxyDoT0QGuyrY7IyammSyP1VivCxS"

java $FRONTEND_JVM_ARGS  \
  -Dsbt.boot.directory=$SBT_BOOT_DIR \
  $DEBUG_PARAMS \
  -DAPP_SECRET=$fake_secret \
  -jar `dirname $0`/dev/sbt-launch-0.13.0.jar "$@"
