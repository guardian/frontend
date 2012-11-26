#!/bin/bash
node_modules/.bin/uglifyjs -o EventEmitter.min.js EventEmitter.js
cp EventEmitter.min.js dist/EventEmitter-${1-dev}.min.js