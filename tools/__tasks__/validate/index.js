const javascript = require('./javascript.js');
const typescript = require('./typescript.js');
const sass = require('./sass.js');
const checkForDisallowedStrings = require('./check-for-disallowed-strings.js');

const task = {
	description: 'Lint assets',
	task: [
		// prettier: multi-line
		javascript,
		typescript,
		sass,
		checkForDisallowedStrings,
	],
	concurrent: true,
};

module.exports = task;
