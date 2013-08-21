#!/bin/bash

set -o xtrace
set -o nounset
set -o errexit


################################################################################
#
# Continuous Integration build hooks.
#
# TeamCity environment variables:
#    ${BUILD_NUMBER}
#    ${DEPLOY_API_KEY}
#    ${TEAMCITY_BUILDCONF_NAME}: e.g. admin
#    ${TEAMCITY_PROJECT_NAME}: e.g. frontend or frontend-integration
#
################################################################################


function lastSuccessful {
  local URL="https://riffraff.gutools.co.uk/api/history?key=${DEPLOY_API_KEY}&pageSize=1&status=Completed&stage=$1&projectName=$2&task=Deploy"
  curl "$URL" | sed 's/.*build":"//g' | sed 's/".*//g'
}

function status {
  local URL="https://riffraff.gutools.co.uk/api/history?key=${DEPLOY_API_KEY}&pageSize=1&stage=$1&projectName=$2&task=Deploy"

  # Take off the json around results to remove incidental `status` fields
  curl "$URL" | sed 's/.*results":\[//g' | sed 's/\].*//g' | \
     sed 's/.*status":"//g' | sed 's/".*//g'
}

function deploy {
  if [ "$(status "$1" "$2")" == "Completed" ]
  then
    echo "Initiating $2 deploy build $3 to $1."
    local URL="https://riffraff.gutools.co.uk/api/deploy/request?key=${DEPLOY_API_KEY}"
    local BODY="{ \"project\": \"$2\", \"build\": \"$3\", \"stage\": \"$1\" }"
    curl --header "Content-Type: application/json" -XPOST -d "$BODY" "$URL"
  else
    echo "Not deploying over unsuccessful current deployment" >&2
  fi
}





case "$1::${TEAMCITY_PROJECT_NAME}::${TEAMCITY_BUILDCONF_NAME}" in

  ##############################################################################
  #
  # Deploy to staging after an application build
  #
  ##############################################################################

  "post::frontend::admin")
    echo "Initiating ${TEAMCITY_BUILDCONF_NAME} deploy build ${BUILD_NUMBER} to CODE staging environment."
    deploy CODE "${TEAMCITY_PROJECT_NAME}::${TEAMCITY_BUILDCONF_NAME}" "${BUILD_NUMBER}"
    ;;



  ##############################################################################
  #
  # Save the currently deployed build number before an integration test
  #
  ##############################################################################

  "pre::frontend-integration::admin-integration-tests")
    # Save the current CODE build number for use in post hook
    lastSuccessful CODE "frontend::${TEAMCITY_BUILDCONF_NAME%-integration-tests}" \
      > "${TEAMCITY_PROJECT_NAME}::${TEAMCITY_BUILDCONF_NAME}.${BUILD_NUMBER}.deploy"
    ;;



  ##############################################################################
  #
  # Deploy to PROD after an integration test if not preempted
  #
  ##############################################################################

  "post::frontend-integration::admin-integration-tests")
    DEPLOYED=$(cat "${TEAMCITY_PROJECT_NAME}::${TEAMCITY_BUILDCONF_NAME}.${BUILD_NUMBER}.deploy")
    CURRENT=$(lastSuccessful CODE "frontend::${TEAMCITY_BUILDCONF_NAME%-integration-tests}")

    if [ "${CURRENT}" == "${DEPLOYED}" ]
    then
      deploy PROD "frontend::${TEAMCITY_BUILDCONF_NAME%-integration-tests}" "${DEPLOYED}"
    else
      echo "Tests preempted by CODE deployment for ${TEAMCITY_PROJECT_NAME}::${TEAMCITY_BUILDCONF_NAME} build ${CURRENT}" >&2
    fi
    ;;



  ##############################################################################
  #
  # Otherwise do nothing.
  #
  ##############################################################################

  *)
    echo "Unrecognised build hook '$1' for '${TEAMCITY_PROJECT_NAME}::${TEAMCITY_BUILDCONF_NAME}'" >&2
    ;;

esac
