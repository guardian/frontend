#!/usr/bin/env node
'use strict';
var spawn = require('child_process').spawn;
var binPath = require('../lib/gifsicle').path;

spawn(binPath, process.argv.slice(2), { stdio: 'inherit' })
	.on('exit', process.exit);
