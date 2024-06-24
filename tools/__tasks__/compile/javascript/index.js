const clean = require('./clean.js');
const inlineSVGs = require('../inline-svgs/index.js');
const copy = require('./copy.js');
const webpack = require('./webpack.js');
const webpackAtoms = require('./webpack-atoms.js');
const bundlePolyfills = require('./bundle-polyfills.js');

const task = {
	description: 'Compile JS',
	task: [
		// prettier: multi-line
		clean,
		inlineSVGs,
		copy,
		webpack,
		webpackAtoms,
		bundlePolyfills,
	],
};

module.exports = task;
