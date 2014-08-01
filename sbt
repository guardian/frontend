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

#http://stackoverflow.com/questions/12114174/what-does-xxmaxpermsize-do
perm_size="-XX:MaxPermSize=$((physical_mem / 3 / 1024))m"

if [ -z $FRONTEND_JVM_ARGS ]; then
    FRONTEND_JVM_ARGS="$jvm_mem $perm_size -XX:ReservedCodeCacheSize=128m -XX:+UseConcMarkSweepGC -Djava.awt.headless=true -XX:NewRatio=4"
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
export APP_SECRET="myKV8HQkjcaxygbDuyneHBeyFgsyyM8yCFFOxyDoT0QGuyrY7IyammSyP1VivCxS"

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
