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
#    ${TEAMCITY_BUILDCONF_NAME}: e.g. admin-integration-tests
#    ${TEAMCITY_PROJECT_NAME}: e.g. frontend-integration
#    $(TEAMCITY_API_URL): Includes HTTP Authentication
#
#    $(DEPLOY_API_URL)
#    ${DEPLOY_API_KEY}
#
################################################################################


function currentStaged {
  local URL="${DEPLOY_API_URL}/history?key=${DEPLOY_API_KEY}&pageSize=1&status=Completed&stage=CODE&projectName=$1&task=Deploy"
  curl "$URL" | sed 's/.*build":"//g' | sed 's/".*//g'
}

function buildType {
  case "$1" in
   "frontend::admin")           echo "bt1127" ;;
   "frontend::applications")    echo "bt1125" ;;
   "frontend::article")         echo "bt1128" ;;
   "frontend::core-navigation") echo "bt1130" ;;
   "frontend::diagnostics")     echo "bt1131" ;;
   "frontend::discussion")      echo "bt1132" ;;
   "frontend::facia")           echo "bt1140" ;;
   "frontend::football")        echo "bt1134" ;;
   "frontend::front")           echo "bt1135" ;;
   "frontend::identity")        echo "bt1158" ;;
   "frontend::image")           echo "bt1136" ;;
   "frontend::interactive")     echo "bt1144" ;;
   "frontend::porter")          echo "bt1151" ;;
   "frontend::r2football")      echo "bt1043" ;;
   "frontend::router")          echo "bt1137" ;;
   "frontend::sport")           echo "bt1147" ;;
   "frontend::style-guide")     echo "bt1138" ;;
   *)
     echo "Unrecognised build '$1'" >&2
     exit 1
     ;;

  esac
}

function tag {
  echo "Tagging $1 build $2 for PROD."
  local URL="${TEAMCITY_API_URL}/app/rest/builds/buildType:$(buildType $1),number:$2/tags"
  curl --header "Content-Type: text/plain" -XPOST -d "PROD" "$URL"
}


################################################################################
#
# TODO: Delete deploy actions after tagging based poll deployment.
#
## START #######################################################################

function status {
  local URL="${DEPLOY_API_URL}/history?key=${DEPLOY_API_KEY}&pageSize=1&stage=$1&projectName=$2&task=Deploy"

  # Take off the json around results to remove incidental `status` fields
  curl "$URL" | sed 's/.*results":\[//g' | sed 's/\].*//g' | \
     sed 's/.*status":"//g' | sed 's/".*//g'
}

function deploy {
  if [ "$(status "$1" "$2")" == "Completed" ]
  then
    echo "Initiating $2 deploy build $3 to $1."
    local URL="${DEPLOY_API_URL}/deploy/request?key=${DEPLOY_API_KEY}"
    local BODY="{ \"project\": \"$2\", \"build\": \"$3\", \"stage\": \"$1\" }"
    curl --header "Content-Type: application/json" -XPOST -d "$BODY" "$URL"
  else
    echo "Not deploying over unsuccessful current deployment" >&2
  fi
}

## END #########################################################################



case "$1::${TEAMCITY_PROJECT_NAME}::${TEAMCITY_BUILDCONF_NAME}" in


  ##############################################################################
  #
  # Save the currently deployed build number before an integration test
  #
  ##############################################################################

  "pre::frontend-integration::admin-integration-tests")
    # Save the current CODE build number for use in post hook
    currentStaged "frontend::${TEAMCITY_BUILDCONF_NAME%-integration-tests}" \
      > "${TEAMCITY_PROJECT_NAME}::${TEAMCITY_BUILDCONF_NAME}.${BUILD_NUMBER}.deploy"
    ;;



  ##############################################################################
  #
  # Deploy to PROD after an integration test if not preempted
  #
  ##############################################################################

  "post::frontend-integration::admin-integration-tests")
    DEPLOYED=$(cat "${TEAMCITY_PROJECT_NAME}::${TEAMCITY_BUILDCONF_NAME}.${BUILD_NUMBER}.deploy")
    CURRENT=$(currentStaged "frontend::${TEAMCITY_BUILDCONF_NAME%-integration-tests}")

    if [ "${CURRENT}" == "${DEPLOYED}" ]
    then
      tag "frontend::${TEAMCITY_BUILDCONF_NAME%-integration-tests}" "${DEPLOYED}"
      # TODO: Delete following line after tagging based poll deployment.
      deploy PROD "frontend::${TEAMCITY_BUILDCONF_NAME%-integration-tests}" "${DEPLOYED}"
    else
      # Silent exit case: the tests passed, they just didn't validate
      # a deployed build. Another attempt will be following.
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
    exit 2
    ;;

esac
