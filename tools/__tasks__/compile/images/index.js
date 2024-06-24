const clean = require('./clean.js');
const copy = require('./copy.js');
const icons = require('./icons.js');
const svg = require('./svg.js');

const task = {
	description: 'Compile images',
	task: [
		// prettier: multi-line
		clean,
		copy,
		icons,
		svg,
	],
};

module.exports = task;
