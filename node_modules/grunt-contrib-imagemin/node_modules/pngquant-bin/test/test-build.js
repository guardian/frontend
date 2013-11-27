/*global describe, it */
'use strict';
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var pngquant = require('../lib/pngquant');
var util = require('../lib/util');
var binPath = pngquant.path;
var srcUrl = pngquant.src;

describe('rebuild', function () {
	it('it should rebuild the binaries', function (cb) {
		this.timeout(false);

		var origCTime = fs.statSync(binPath).ctime;
		util.build(srcUrl, path.dirname(binPath), function (err) {
			var actualCTime = fs.statSync(binPath).ctime;
			assert(actualCTime !== origCTime);
			cb(err);
		}).path;
	});
});
