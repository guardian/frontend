#!/usr/bin/env bash

set -e

# colours
YELLOW='\033[1;33m'
NC='\033[0m' # no colour - reset console colour

SOURCE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NGINX_HOME=$(nginx -V 2>&1 | grep "configure arguments:" | sed 's/[^*]*conf-path=\([^ ]*\)\/nginx\.conf.*/\1/g')
DOMAIN='m.thegulocal.com'

CERT_DIRECTORY=$HOME/.gu/mkcert
KEY_FILE=${CERT_DIRECTORY}/${DOMAIN}.key
CERT_FILE=${CERT_DIRECTORY}/${DOMAIN}.crt

# mkcert requires the JAVA_HOME envvar to be set to add the generated CA to Java's trust store
# see https://github.com/FiloSottile/mkcert#supported-root-stores
export JAVA_HOME=$(/usr/libexec/java_home)

mkcert -install

echo -e "🔐 Creating certificate for: ${YELLOW}$@${NC}"
mkdir -p ${CERT_DIRECTORY}
mkcert -key-file=${KEY_FILE} -cert-file=${CERT_FILE} ${DOMAIN}

echo -e "🔗 Symlinking the certificate for nginx at ${NGINX_HOME}"
ln -sf ${KEY_FILE} ${NGINX_HOME}/${DOMAIN}.key
ln -sf ${CERT_FILE} ${NGINX_HOME}/${DOMAIN}.crt

echo -e "🔗 Symlinking nginx config file"
ln -sf ${SOURCE_DIR}/frontend.conf ${NGINX_HOME}/servers/frontend.conf

echo -e "🚀 ${YELLOW}Restarting nginx, Requires sudo - enter password when prompted.${NC}"
sudo nginx -s stop
sudo nginx

if grep '127.0.0.1' /etc/hosts | grep ${DOMAIN} ; then
  echo -e "✅ /etc/hosts entry already exists for ${DOMAIN}"
else
  echo -e "🔧 ${YELLOW}adding /etc/hosts entry for ${DOMAIN}. Requires sudo - enter password when prompted.${NC}"
  sudo sh -c "echo '127.0.0.1		${DOMAIN}' >> /etc/hosts"
fi

echo -e "💯 Done! You can now run frontend locally on https://${DOMAIN}"
