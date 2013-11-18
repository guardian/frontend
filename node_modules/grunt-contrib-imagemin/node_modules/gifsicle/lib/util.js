'use strict';
var fs = require('fs');
var path = require('path');
var os = require('os');
var mkdir = require('mkdirp');
var chalk = require('chalk');
var exec = require('child_process').exec;
var which = require('which');
var tar = require('tar');
var zlib = require('zlib');
var request = require('request').defaults({
	proxy: process.env.http_proxy || process.env.HTTP_PROXY ||
			process.env.https_proxy || process.env.HTTPS_PROXY || ''
});
var progress = require('request-progress');
var tmpdir = os.tmpdir ? os.tmpdir() : os.tmpDir();
var util = module.exports;

util.fetch = function (url, dest, cb) {
	cb = cb || function () {};

	if (!fs.existsSync(path.dirname(dest))) {
		mkdir.sync(path.dirname(dest));
	}

	return progress(request.get(url))
		.on('response', function (resp) {
			var status = resp.statusCode;

			if (status < 200 || status > 300) {
				return cb(new Error('Status code ' + status));
			}
		})
		.on('progress', function (state) {
			console.log(chalk.cyan('Downloading %s: %s%'), path.basename(url), state.percent);
		})
		.on('error', cb)
		.pipe(fs.createWriteStream(dest))
		.on('close', cb);
};

util.extract = function (src, dest, cb) {
	cb = cb || function () {};
	var file = path.basename(src);

	if (path.extname(file) !== '.gz') {
		return cb(new Error('File ' + file + ' is not a known archive'));
	}

	return fs.createReadStream(src)
		.on('error', cb)
		.pipe(zlib.Unzip())
		.on('error', cb)
		.pipe(tar.Extract({ path: dest, strip: 1 }))
		.on('error', cb)
		.on('close', function () {
			fs.unlink(src);
			cb();
		});
};

util.build = function (url, dest, cb) {
	if (!(process.platform === 'darwin' || process.platform === 'linux')) {
		return cb(new Error('Building is not supported on ' + process.platform));
	}

	cb = cb || function () {};
	var self = this;
	var file = path.join(tmpdir, path.basename(url));
	var tmp = path.join(tmpdir, path.basename(file, '.tar.gz'));
	var buildScript = './configure --disable-gifview --disable-gifdiff' +
					  ' --prefix="' + tmp + '" --bindir="' + dest +
					  '" && ' + 'make install';

	try {
		which.sync('make');
	} catch (err) {
		return cb(new Error('`make` not found'));
	}

	return this.fetch(url, file, function (err) {
		if (err) {
			return cb(new Error(err.message));
		}

		self.extract(file, tmp, function (err) {
			if (err) {
				return cb(new Error(err.message));
			}

			exec(buildScript, { cwd: tmp }, function (err) {
				if (err) {
					return cb(new Error(err.message));
				}

				cb();
			});
		});
	});
};
