#!/bin/bash
set -e

readonly SYSTEM=$(uname -s)
EXTRA_STEPS=()
BASEDIR=$(dirname $0)

linux() {
  [[ $SYSTEM == 'Linux' ]]
}

mac() {
  [[ $SYSTEM == 'Darwin' ]]
}

installed() {
  hash "$1" 2>/dev/null
}

nvm_installed() {
  if [ -d '/usr/local/Cellar/nvm' ] || [ -d "$HOME/.nvm" ]; then
    true
  else
    false
  fi
}

create_install_vars() {
  local path="/etc/gu"
  local filename="install_vars"

  if [[ ! -f "$path/$filename" ]]; then
    if [[ ! -d "$path" ]]; then
      sudo mkdir "$path"
    fi

    echo "STAGE=DEV" | sudo tee "$path/$filename" > /dev/null
  fi
}

install_awscli() {
  if ! installed aws; then
    if linux; then
      sudo apt-get install -y awscli
    elif mac; then
      brew install awscli
    fi
  fi
}

create_frontend_properties() {
  local path="$HOME/.gu"
  local filename="frontend.properties"

  if [[ ! -f "$path/$filename" ]]; then
    if [[ ! -d "$path" ]]; then
      mkdir "$path"
    fi

    aws s3 cp --profile frontend s3://aws-frontend-store/template-frontend.properties "$path/$filename"
  fi
}

create_aws_config() {
  local path="$HOME/.aws"
  local filename="config"

  if [[ ! -f "$path/$filename" ]]; then
    if [[ ! -d "$path" ]]; then
      mkdir "$path"
    fi

    echo "[profile frontend]
region = eu-west-1" > "$path/$filename"
  fi
}

install_homebrew() {
  if mac && ! installed brew; then
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  fi
}

install_jdk() {
  if ! installed javac; then
    if linux; then
      sudo apt-get install -y openjdk-7-jdk
    elif mac; then
      EXTRA_STEPS+=("Download the JDK from http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html")
    fi
  fi
}

install_node() {
  if ! nvm_installed; then
    if linux; then
      if ! installed curl; then
        sudo apt-get install -y curl
      fi

      curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash
    elif mac && installed brew; then
      brew install nvm
    fi

    nvm install
    EXTRA_STEPS+=("Add https://git.io/vKTnK to your .bash_profile")
  fi
}

install_grunt() {
  if ! installed grunt; then
    npm -g install grunt-cli
  fi
}

install_gcc() {
  if ! installed g++; then
    if linux; then
      sudo apt-get install -y g++ make
    elif mac; then
      EXTRA_STEPS+=("Install Xcode from the App Store")
    fi
  fi
}

install_libpng() {
  if ! installed libpng-config; then
    if linux; then
      sudo apt-get install -y libpng-dev
    elif mac; then
      brew install libpng
    fi
  fi
}

compile() {
  make install compile
}

report() {
  if [[ ${#EXTRA_STEPS[@]} -gt 0 ]]; then
    node ./tools/messages.js install-steps
    for i in "${!EXTRA_STEPS[@]}"; do
      echo "  $((i+1)). ${EXTRA_STEPS[$i]}"
    done
  fi
}

main() {
  create_install_vars
  create_aws_config
  install_homebrew
  install_awscli
  create_frontend_properties
  install_jdk
  install_node
  install_gcc
  install_grunt
  install_libpng
  compile
  report
}

main
