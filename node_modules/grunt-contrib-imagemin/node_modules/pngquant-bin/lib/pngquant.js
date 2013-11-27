'use strict';
var path = require('path');
var url = require('url');

var target = {
	name: 'pngquant',
	url: 'https://raw.github.com/sindresorhus/node-pngquant-bin/master/',
	src: 'https://github.com/pornel/pngquant/archive/1e28372f564ec4ed30f44a88da5406e7210d682f.tar.gz',
	pathPrefix: '../vendor',
	urlPrefix: 'vendor',
	platforms: {
		darwin: {
			path: 'osx'
		},
		linux: {
			path: 'linux',
			arch: true
		},
		win32: {
			path: 'win',
			suffix: 'exe'
		}
	}
};

function getPathToPackagedBinary(target, options) {
	var platform = target.platforms[process.platform];

	if (platform === undefined) {
		return console.error('Unsupported platform:', process.platform, process.arch);
	}

	options = options || {};
	options.url = options.url || false;

	var targetPath = [];
	var targetPrefix = target.pathPrefix;
	var arch = process.arch === 'x64' ? 'x64' : 'x86';
	var exec = target.name;

	if (options.url) {
		targetPrefix = target.urlPrefix;
	}

	targetPath.push(targetPrefix);

	if (options.url) {
		targetPath.push(platform.path);
	} else {
		targetPath.unshift(__dirname);
	}

	if (options.url && platform.arch === true) {
		targetPath.push(arch);
	}

	if (platform.suffix !== undefined) {
		exec += '.' + platform.suffix;
	}

	targetPath.push(exec);

	if (options.url) {
		return url.resolve(target.url, targetPath.join('/'));
	} else {
		return path.join.apply(__dirname, targetPath);
	}
}

exports.path = getPathToPackagedBinary(target);
exports.url = getPathToPackagedBinary(target, { url: true });
exports.src = target.src;
