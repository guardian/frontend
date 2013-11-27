/*global describe, it */
'use strict';
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var gifsicle = require('../lib/gifsicle');
var util = require('../lib/util');
var binPath = gifsicle.path;
var srcUrl = gifsicle.src;

describe('Gifsicle rebuild', function () {
	it('it should rebuild the gifsicle binaries', function (cb) {
		// Give this test time to build
		this.timeout(false);

		var origCTime = fs.statSync(binPath).ctime;
		util.build(srcUrl, path.dirname(binPath), function (err) {
			var actualCTime = fs.statSync(binPath).ctime;
			assert(actualCTime !== origCTime);
			cb(err);
		}).path;
	});
});
