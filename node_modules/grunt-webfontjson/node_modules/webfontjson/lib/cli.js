#!/usr/bin/env node
'use strict';

var fs      = require('fs');
var program = require('commander');
var build   = require('./build');

function readConfigFile(configFile, callback) {
	fs.readFile(process.cwd() + '/' + configFile, 'utf8', function(e, data) {
		callback(JSON.parse(data));
	})
}

if (!module.parent) {

	program
		.command('*')
		.description('Build a font json from a given config file')
		.action(function(configFile) {
			console.log("Building font JSON files.");
			readConfigFile(configFile, function(fontJson) {
				build.buildFontFiles(fontJson, function() {
					console.log('Files created');
				});
			});
		});

	program.parse(process.argv);
}

// Expose for unittests.
module.exports = {
	readConfigFile: readConfigFile
}