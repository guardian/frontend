#!/bin/bash

#####################################################
#
# Used to provision the Vagrant VM
#
#####################################################


#####################################################
# create the install_vars file. This is needed to
# configure the application
#####################################################
mkdir /etc/gu

echo 'STAGE=DEV
INT_SERVICE_DOMAIN=gudev.gnl
EXT_SERVICE_DOMAIN=' > /etc/gu/install_vars
#####################################################

###########################################################################################
# Install NodeJS https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
###########################################################################################
sudo apt-get update
sudo apt-get install -y python-software-properties python g++ make
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install -y nodejs
###########################################################################################

sudo apt-get install -y graphicsmagick

sudo npm -g install grunt-cli

sudo apt-get install -y  -o "Acquire::http::Timeout=900" openjdk-7-jdk

sudo apt-get install -y ruby1.9.1-full

sudo apt-get -y install git

sudo gem install bundler


