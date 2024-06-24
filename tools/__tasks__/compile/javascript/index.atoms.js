const clean = require('./clean');
const inlineSVGs = require('../inline-svgs');
const webpackAtoms = require('./webpack-atoms');

const task = {
	description: 'Compile JS',
	task: [
		// prettier: multi-line
		clean,
		inlineSVGs,
		webpackAtoms,
	],
};

module.exports = task;
