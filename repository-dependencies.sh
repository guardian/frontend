#!/bin/bash

#Install casperjs to target
if [ -f dev/casperjs ]; then
    echo "CasperJS installed"
else
    git clone git://github.com/n1k0/casperjs.git dev/casperjs
    cd dev/casperjs
    git checkout tags/1.0.2
    cd ../..
fi
export PATH=$PATH:$(pwd)/dev/casperjs/bin
export PATH=$PATH:$(pwd)/node_modules/phantomjs/bin
