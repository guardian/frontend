const javascript = require('./javascript');
const sass = require('./sass');

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
