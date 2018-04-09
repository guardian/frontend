#!/bin/bash

# Setup Nginx for local developement
#
# Copies Nginx configuration and SSL certificates to Nginx home (usually /usr/local/etc/nginx)
# Make sure you have valid AWS credentials and then run with sudo setup.sh <profile name>
# Remember to add nginx/hosts to your /etc/hosts

SSL_CERT_NAME="wildcard-thegulocal-com-exp2019-01-09"
S3_BUCKET="s3://identity-local-ssl/"
NGINX_SITE_CONF="frontend.conf"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
nginxHome=`nginx -V 2>&1 | grep "configure arguments:" | sed 's/[^*]*conf-path=\([^ ]*\)\/nginx\.conf.*/\1/g'`
jdkHome=`/usr/libexec/java_home`

echo "Checking awscli is installed"
which aws 1>/dev/null 2>&1
if [[ $? -gt 0 ]]; then
	echo 'ERROR: Cannot find AWS CLI utility. Please install it before running this script.'
	exit 1
fi

echo "Checking AWS credentials are valid"
if [ -z "$1" ]; then
	PROFILE=""
else
	PROFILE="--profile ${1}"
fi

aws ${PROFILE} s3 ls ${S3_BUCKET} 1>/dev/null 2>&1
if [[ $? -gt 0 ]]; then
	echo "ERROR: You do not have access to the Identity AWS account. Re-run with ${0} <profile name> to use a different profile."
	exit 2
fi

echo "Checking Nginx sites-enabled directory exists"
ls "${nginxHome}/sites-enabled" 1>/dev/null 2>&1
if [[ $? -gt 0 ]]; then
	echo "ERROR: Missing ${nginxHome}/sites-enabled"
    echo "Create sites-enabled directory and make sure it is included in your nginx.conf (usually in ${nginxHome}/nginx.conf):
            http {
                include       mime.types;
                default_type  application/octet-stream;
                # THIS IS WHAT YOU MUST ADD
                include sites-enabled/*;
            #..."
	exit 1
fi

function install_ssh_certificate() {
	KEY_NAME="${1}.key"
	CRT_NAME="${1}.crt"
	echo "Downloading SSL certificate $CRT_NAME from $S3_BUCKET"
	aws ${PROFILE} s3 cp "${S3_BUCKET}${KEY_NAME}" ${DIR} 1>/dev/null
	echo "Downloading SSL key $KEY_NAME from $S3_BUCKET"
	aws ${PROFILE} s3 cp "${S3_BUCKET}${CRT_NAME}" ${DIR} 1>/dev/null

	echo "Linking SSL certs/keys to $nginxHome"
	sudo ln -fs "${DIR}/${CRT_NAME}" "${nginxHome}/${CRT_NAME}"
	sudo ln -fs "${DIR}/${KEY_NAME}" "${nginxHome}/${KEY_NAME}"
}

function install_ssh_certificate_in_jdk_ca() {
    echo "Importing SSL certificate into Java keystore ${jdkHome}/jre/lib/security/cacerts"
	sudo "${jdkHome}/bin/keytool" -import -alias ${1} -keystore "${jdkHome}/jre/lib/security/cacerts" -file "${1}.crt" -storepass "changeit" -noprompt
}

function install_nginx_configuration() {
    echo "Linking Nginx configuration ${1} to $nginxHome/sites-enabled"
    sudo ln -fs "$DIR/${1}" "$nginxHome/sites-enabled/${1}"
}

install_ssh_certificate ${SSL_CERT_NAME}
install_ssh_certificate_in_jdk_ca ${SSL_CERT_NAME}
install_nginx_configuration ${NGINX_SITE_CONF}

echo "Restarting Nginx"
sudo nginx -s stop
sudo nginx

echo "Done. (To setup Dotcom Identity Frontend please follow identity-platform README.)"
