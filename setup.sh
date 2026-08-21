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

install_mise() {
  if ! installed mise; then
    if mac; then
      brew install mise
    elif linux; then
      if ! installed curl; then
        sudo apt-get install -y curl
      fi
      curl https://mise.run | sh
      export PATH="$HOME/.local/bin:$PATH"
    fi

    EXTRA_STEPS+=("Activate mise in your shell - see https://mise.jdx.dev/getting-started.html#activate-mise (e.g. add \`eval \"\$(mise activate zsh)\"\` to your ~/.zshrc)")
  fi
}

# Installs the JDK, Node etc. at the versions pinned in .tool-versions
install_tools() {
  (cd "$BASEDIR" && mise install)

  # make the just-installed tools available to the rest of this script,
  # even if mise isn't activated in the current shell yet
  export PATH="${MISE_DATA_DIR:-$HOME/.local/share/mise}/shims:$PATH"
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
  install_mise
  install_tools
  install_gcc
  install_libpng
  compile
  report
}

main
