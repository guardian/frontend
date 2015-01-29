#!/bin/bash

set -o errexit

bundle install --system

if [ -f "~/.sbtconfig" ]; then
  . ~/.sbtconfig
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
    physical_mem=$(sysctl hw.memsize | cut -d' ' -f2 | grep . | awk '{print $1 / 1024}')
else
    physical_mem=$(grep MemTotal /proc/meminfo | awk '{print $2}')
fi

#http://stackoverflow.com/questions/5374455/what-does-java-option-xmx-stand-for
jvm_mem="-Xmx$((physical_mem / 2 / 1024))m"


if [ -z $FRONTEND_JVM_ARGS ]; then
    FRONTEND_JVM_ARGS="$jvm_mem -XX:MaxPermSize=256M -XX:ReservedCodeCacheSize=128m -XX:+UseConcMarkSweepGC -Djava.awt.headless=true -XX:NewRatio=4"
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

export APP_SECRET="this_is_not_a_real_secret_just_for_tests"

####################################################################################
#
#  Australia/Sydney  -because it is too easy for devs to forget about timezones
#
####################################################################################
java $FRONTEND_JVM_ARGS  \
  $DEBUG_PARAMS \
  -Dsbt.ivy.home=`dirname $0`/ivy-sbt \
  -Duser.timezone=Australia/Sydney \
  -jar `dirname $0`/dev/sbt-launch.jar "$@"
