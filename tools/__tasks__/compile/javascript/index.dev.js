const inlineSVGs = require('../inline-svgs/index.js');
const clean = require('./clean.js');
const copy = require('./copy.js');
const webpack = require('./webpack.dev.js');
const bundlePolyfills = require('./bundle-polyfills.js');

const task = {
	description: 'Prepare JS for development',
	task: [
		// prettier: multi-line
		inlineSVGs,
		clean,
		copy,
		webpack,
		bundlePolyfills,
	],
};

module.exports = task;
