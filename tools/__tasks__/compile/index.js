const clean = require('./conf/clean.js');
const css = require('./css/index.js');
const data = require('./data/index.js');
const javascript = require('./javascript/index.js');
const hash = require('./hash/index.js');
const conf = require('./conf/index.js');

const task = {
	description: 'Compile assets for production',
	task: [
		// prettier: multi-line
		clean,
		css,
		data,
		javascript,
		hash,
		conf,
	],
};

module.exports = task;
