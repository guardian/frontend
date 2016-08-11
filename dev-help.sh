#!/bin/sh

# Make the prompt prettier
export PS1="[🐳 :\h]\w# "

# Display some useful dev commands
bold=`tput bold` 

background=`tput setab 6`

black=`tput setaf 0`
red=`tput setaf 1`
green=`tput setaf 2`
white=`tput setaf 7`

reset=`tput sgr0`

echo "${background}"
echo "${white}${bold}Main commands:"
echo ""
echo "   ${bold}make install        Install node 3rd party dependencies"
echo "   ${bold}make compile-dev    Compile all assets for development"
echo "   ${bold}make watch          Watch and automatically reload all js/css (Uses port 3000)"
echo "   ${bold}make test           Run the js test suite"
echo "   ${bold}make help           More make commands"
echo ""
echo "   ${bold}./sbt               Run sbt"
echo "$reset"
