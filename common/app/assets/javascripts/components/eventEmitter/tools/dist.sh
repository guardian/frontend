#!/bin/bash
node_modules/.bin/uglifyjs\
	--comments\
	--mangle sort=true\
	--compress\
	--output EventEmitter.min.js EventEmitter.js
cp EventEmitter.min.js dist/EventEmitter-${1-dev}.min.js