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

check_encryption() {

    if linux; then
        EXTRA_STEPS+=("Sorry, can't check if your hard disk is encrypted - please ensure that it is! (applies to both portable and Desktop machines)")
    elif mac; then
        if [[ "$(fdesetup status)" != "FileVault is On." ]]; then
            EXTRA_STEPS+=("your hard disk is not encrypted! Encryption must be enabled on all guardian machines. Follow these instructions: https://support.apple.com/en-gb/HT204837")
        fi
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
      EXTRA_STEPS+=("Download the JDK from https://adoptopenjdk.net")
    fi
  fi
}

mise_installed() {
    if [ -x "$(command -v mise)" ]; then
        true
    else
        false
    fi
}

install_mise() {
    if ! mise_installed; then
        if mac; then
            brew install mise
        fi
    fi
}

install_node() {
    if ! mise_installed; then
        brew install mise
        echo "To enable the mise package manager add https://gist.github.com/ioannakok/5f08d4e603c53bc81b97d3f4846b8a1f to your .zshrc"
        echo "Once done, run 'source ~/.zshrc' and then run the setup.sh script again"
        exit
    fi
    mise install
}

install_dev-nginx() {
  if ! installed nginx; then
    if linux; then
      sudo apt-get install -y nginx
    elif mac; then
      brew install nginx
    fi
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
    echo "";
    echo "Please run the following to complete your installation:"
    echo "=======================================================";
    echo "";
    for i in "${!EXTRA_STEPS[@]}"; do
      echo "  $((i+1)). ${EXTRA_STEPS[$i]}"
    done
  fi
}

main() {
  check_encryption
  create_aws_config
  install_homebrew
  install_jdk
  install_node
  install_gcc
  install_libpng
  compile
  report
}

main
