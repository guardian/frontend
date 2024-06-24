const clean = require('./clean.js');
const download = require('./download.js');
const amp = require('./amp.js');

const task = {
	description: 'Clean download and build data assets (dev)',
	task: [
		// prettier: multi-line
		clean,
		download,
		amp,
	],
};

module.exports = task;
