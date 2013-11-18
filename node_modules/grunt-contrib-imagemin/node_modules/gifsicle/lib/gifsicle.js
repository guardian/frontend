'use strict';
var path = require('path');
var url = require('url');

var target = {
	name: 'gifsicle',
	url: 'https://raw.github.com/yeoman/node-gifsicle/master/',
	src: 'http://www.lcdf.org/gifsicle/gifsicle-1.71.tar.gz',
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
			arch: true,
			suffix: 'exe'
		},
		freebsd: {
			path: 'freebsd',
			arch: true
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
