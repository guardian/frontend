'use strict';
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var Mocha = require('mocha');
var mocha = new Mocha({ui: 'bdd', reporter: 'min'});
var util = require('./util');
var bin = require('./gifsicle');

function runBuild() {
	return util.build(bin.src, path.dirname(bin.path), function (err) {
		if (err) {
			return console.log(chalk.red('✗ %s'), err.message);
		}

		console.log(chalk.green('✓ gifsicle rebuilt successfully'));
	});
}

function runTest() {
	mocha.addFile('test/test-gifsicle-path.js');
	mocha.run(function (failures) {
		if (failures > 0) {
			console.log(chalk.red('✗ pre-build test failed, compiling from source...'));
			runBuild();
		} else {
			console.log(chalk.green('✓ pre-build test passed successfully, skipping build...'));
		}
	});
}

if (fs.existsSync(bin.path)) {
	runTest();
} else {
	util.fetch(bin.url, bin.path, function (err) {
		if (err) {
			return console.log(chalk.red('✗ %s'), err.message);
		}

		fs.chmod(bin.path, '0755');
		runTest();
	});
}
