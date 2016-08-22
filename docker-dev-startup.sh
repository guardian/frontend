#!/bin/sh

# Prompt colors
bold=`tput bold` 

background=`tput setab 6`

black=`tput setaf 0`
red=`tput setaf 1`
green=`tput setaf 2`
white=`tput setaf 7`

reset=`tput sgr0`

# Make the prompt prettier
export PS1="[🐳 :\h]\w# "

# Update node dependencies
echo "${background}${white}${bold}Updating node dependencies...${reset}"
pushd /frontend > /dev/null; npm install && npm prune; popd > /dev/null
echo "${background}${white}${bold}Done updating node dependencies${reset}"

# Display some useful dev commands
echo "${background}"
echo "${white}${bold}Main commands:"
echo ""
echo "   make watch          Watch and automatically reload all js/css (Uses port 3000)"
echo "   make test           Run the js test suite"
echo "   make install        Install node 3rd party dependencies"
echo "   make compile-dev    Compile all assets for development"
echo "   make help           More make commands"
echo ""
echo "   ./sbt               Run sbt"
echo "$reset"
