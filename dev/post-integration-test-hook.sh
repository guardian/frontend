#!/bin/bash

set -o xtrace
set -o nounset
set -o errexit


################################################################################
#
# Continuous Integration post integration-test hook.
#
# Available environment variables:
#    ${TRIGGERING_BUILD_NUMBER}: Currently staged build number
#    ${TEAMCITY_BUILDCONF_NAME}: e.g. admin-integration-tests
#    $(TEAMCITY_API_URL): Includes HTTP Authentication
#    $(DEPLOY_API_URL)
#    ${DEPLOY_API_KEY}
#
################################################################################

function currentStaged {
  local URL="${DEPLOY_API_URL}/history?key=${DEPLOY_API_KEY}&pageSize=1&status=Completed&stage=CODE&projectName=frontend::$1&task=Deploy"
  curl "$URL" | sed 's/.*build":"//g' | sed 's/".*//g'
}

function tag {
  echo "Tagging $1 build $2 for PROD."

  ##############################################################################
  #
  # On update to TeamCity 8 replace the following with:
  #   local URL="${TEAMCITY_API_URL}/app/rest/builds/project:frontend,buildType:(name:$1),number:$2/tags"
  #
  ##START#######################################################################
  case "$1" in
    admin)
      local BUILD_TYPE="bt1127"
      ;;
    applications)
      local BUILD_TYPE="bt1125"
      ;;
    article)
      local BUILD_TYPE="bt1128"
      ;;
    core-navigation)
      local BUILD_TYPE="bt1130"
      ;;
    diagnostics)
      local BUILD_TYPE="bt1131"
      ;;
    discussion)
      local BUILD_TYPE="bt1132"
      ;;
    facia)
      local BUILD_TYPE="bt1140"
      ;;
    football)
      local BUILD_TYPE="bt1134"
      ;;
    front)
      local BUILD_TYPE="bt1135"
      ;;
    identity)
      local BUILD_TYPE="bt1158"
      ;;
    image)
      local BUILD_TYPE="bt1136"
      ;;
    interactive)
      local BUILD_TYPE="bt1144"
      ;;
    porter)
      local BUILD_TYPE="bt1151"
      ;;
    router)
      local BUILD_TYPE="bt1137"
      ;;
    sport)
      local BUILD_TYPE="bt1147"
      ;;
    *)
      local URL="(project:frontend,name:$1)"
      ;;
  esac

  local URL="${TEAMCITY_API_URL}/app/rest/builds/buildType:${BUILD_TYPE},number:$2/tags"
  ##END#########################################################################

  curl --header "Content-Type: text/plain" -XPOST -d "PROD" "$URL"
}


################################################################################
#
# Mark for production deployment following integration testing if not preempted.
#
################################################################################

if [ "${TRIGGERING_BUILD_NUMBER-unset}" == "unset" ]
then
  echo "Tests not triggered by continuous deployment."
  exit 0
fi

PROJECT=${TEAMCITY_BUILDCONF_NAME%-integration-tests}
CURRENT=$(currentStaged "${PROJECT}")

if [ "${CURRENT}" != "${TRIGGERING_BUILD_NUMBER}" ]
then
  # The tests passed, just not on a stable build. Another attempt will follow.
  echo "Tests preempted by staging deployment for ${PROJECT} build ${CURRENT}."
  exit 0
fi

tag "${PROJECT}" "${CURRENT}"

