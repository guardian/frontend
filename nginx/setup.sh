#!/usr/bin/env bash

set -e

# colours
YELLOW='\033[1;33m'
NC='\033[0m' # no colour - reset console colour

DOMAIN='m.thegulocal.com'
SOURCE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

dev-nginx setup-cert ${DOMAIN}
dev-nginx link-config ${SOURCE_DIR}/frontend.conf
dev-nginx add-to-hosts-file ${DOMAIN}
dev-nginx restart-nginx

echo -e "💯 Done! You can now run frontend locally on https://${DOMAIN}"
echo -e "👤 To setup Dotcom Identity Frontend please follow identity-platform README."
echo -e "👋"
