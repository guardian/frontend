const javascript = require('./javascript.js');
const sass = require('./sass.js');

const task = {
	description: 'Validate commits',
	task: [
		// prettier: multi-line
		javascript,
		sass,
	],
	concurrent: true,
};

module.exports = task;
