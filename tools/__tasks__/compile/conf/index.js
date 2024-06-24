const copy = require('./copy.js');
const inlineSVGs = require('../inline-svgs/index.js');

const task = {
	description: 'Compile assets for template rendering in Play',
	task: [
		// prettier: multi-line
		copy,
		inlineSVGs,
	],
};

module.exports = task;
