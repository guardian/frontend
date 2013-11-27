/*global describe, it, after */
'use strict';
var fs = require('fs');
var path = require('path');
var execFile = require('child_process').execFile;
var assert = require('assert');

describe('pngquant', function () {
	after(function () {
		fs.unlinkSync('test/fixtures/test-fs8.png');
	});

	it('should return path to pngquant binary', function (cb) {
		var binPath = require('../lib/pngquant').path;

		execFile(binPath, ['--version', '-'], function (err, stdout) {
			assert(/\d\.\d\.\d/.test(stdout));
			cb();
		});
	});

	it('should successfully proxy pngquant', function (cb) {
		var binPath = path.join(__dirname, '../bin/pngquant.js');

		execFile('node', [binPath, '--version', '-'], function (err, stdout) {
			assert(/\d\.\d\.\d/.test(stdout));
			cb();
		});
	});

	it('should minify a .png', function (cb) {
		var binPath = path.join(__dirname, '../bin/pngquant.js');
		var args = [
			path.join(__dirname, 'fixtures', 'test.png')
		];

		execFile('node', [binPath].concat(args), function () {
			var actual = fs.statSync('test/fixtures/test-fs8.png').size;
			var original = fs.statSync('test/fixtures/test.png').size;
			assert(actual < original);
			cb();
		});
	});
});
