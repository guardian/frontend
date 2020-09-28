#!/bin/bash

set -o errexit

if [ -f "~/.sbtconfig" ]; then
  . ~/.sbtconfig
fi

JAVA_VERSION=$(sbt 'eval sys.props("java.version")' \
| egrep -o "(ans: String = )(.+)" \
| egrep -o "\S+" \
| tail -1 \
| egrep -o ".{5}" \
| head -1)

echo "JAVA_VERSION=$JAVA_VERSION"

if [ "$JAVA_VERSION" != "1.8.0" ]; then
    echo "SBT is not using Java 8. Have you set JAVA_HOME in your profile?"
    exit 1
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
    FRONTEND_JVM_ARGS="$jvm_mem -XX:ReservedCodeCacheSize=128m -Djava.awt.headless=true -XX:NewRatio=4"
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
  -Duser.timezone=Australia/Sydney \
  -jar `dirname $0`/bin/sbt-launch.jar "$@"
