const data = require('../compile/data/index.js');
const javascript = require('./javascript/index.js');

const task = {
	description: 'Test assets',
	task: [
		// prettier: multi-line
		data,
		javascript,
	],
	concurrent: true,
};

module.exports = task;
