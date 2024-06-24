const clean = require('./conf/clean.js');
const css = require('./css/index.dev.js');
const data = require('./data/index.dev.js');
const javascript = require('./javascript/index.dev.js');
const conf = require('./conf/index.js');

const task = {
	description: 'Compile assets for development',
	task: [
		// prettier: multi-line
		clean,
		css,
		data,
		javascript,
		conf,
	],
};

module.exports = task;
