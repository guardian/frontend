const clean = require('./clean.js');
const mkdir = require('./mkdir.js');
const images = require('../images/index.js');
const sass = require('./sass.js');

const task = {
	description: 'Compile CSS',
	task: [
		// prettier: multi-line
		clean,
		mkdir,
		images,
		sass,
	],
};

module.exports = task;
