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


case "${TEAMCITY_PROJECT_NAME}::${TEAMCITY_BUILDCONF_NAME}" in

  "frontend::admin")
    echo "Initiating ${TEAMCITY_BUILDCONF_NAME} deploy build ${BUILD_NUMBER} to CODE staging environment."

    URL="https://riffraff.gutools.co.uk/api/deploy/request?key=${DEPLOY_API_KEY}"
    BODY="{ \"project\": \"${TEAMCITY_PROJECT_NAME}::${TEAMCITY_BUILDCONF_NAME}\", \"build\": \"${BUILD_NUMBER}\", \"stage\": \"CODE\" }"

    curl --header "Content-Type: application/json" -XPOST -d "$BODY" "$URL"
    ;;

  *)
    echo "Unrecognised build for post build hook: '${TEAMCITY_PROJECT_NAME}::${TEAMCITY_BUILDCONF_NAME}'" >&2
    # TODO: Enable when all projects have been moved to use post build hooks
    #       and CI build template updated to include step.
    #exit 1
    ;;

esac
