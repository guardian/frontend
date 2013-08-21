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
  local URL="${TEAMCITY_API_URL}/app/rest/builds/buildType:(project:frontend,name:$1),number:$2/tags"
  curl --header "Content-Type: text/plain" -XPOST -d "PROD" "$URL"
}


################################################################################
#
# Mark for production deployment following integration testing if not preempted.
#
################################################################################

PROJECT=${TEAMCITY_BUILDCONF_NAME%-integration-tests}
TRIGGERING_BUILD_NUMBER=${TRIGGERING_BUILD_NUMBER-NONE}
CURRENT=$(currentStaged "${PROJECT}")

if [ "${CURRENT}" != "${TRIGGERING_BUILD_NUMBER}" ]
then
  # The tests passed, just not on a stable build. Another attempt will follow.
  echo "Tests preempted by staging deployment for ${PROJECT} build ${CURRENT}" >&2
  exit 0
fi

tag "${PROJECT}" "${CURRENT}"





################################################################################
#
# TODO: Delete following after tagging based deployment enabled.
#
################################################################################

function productionStatus {
  local URL="${DEPLOY_API_URL}/history?key=${DEPLOY_API_KEY}&pageSize=1&stage=PROD&projectName=$1&task=Deploy"

  # Take off the json around results to remove incidental `status` fields
  curl "$URL" | sed 's/.*results":\[//g' | sed 's/\].*//g' | \
     sed 's/.*status":"//g' | sed 's/".*//g'
}

function productionDeploy {
  if [ "$(productionStatus "$1")" == "Completed" ]
  then
    echo "Initiating $1 deploy build $2 to production."
    local URL="${DEPLOY_API_URL}/deploy/request?key=${DEPLOY_API_KEY}"
    local BODY="{ \"project\": \"frontend::$1\", \"build\": \"$2\", \"stage\": \"PROD\" }"
    curl --header "Content-Type: application/json" -XPOST -d "$BODY" "$URL"
  else
    echo "Not deploying over unsuccessful current deployment" >&2
  fi
}


productionDeploy "${PROJECT}" "${CURRENT}"

################################################################################
