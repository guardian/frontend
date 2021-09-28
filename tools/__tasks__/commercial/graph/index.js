const fs = require('fs');
const path = require('path');
const madge = require('madge');

const filename = 'standalone.commercial.ts';
const entry = process.cwd() + '/static/src/javascripts/bootstraps/' + filename;
const config = {
	webpackConfig: 'webpack.config.commercial.prod.js',
	tsConfig: 'tsconfig.json',
	includeNpm: true,
};

const graphFile = `${__dirname}/output/${filename}.json`;

module.exports = {
	description: 'Create JSON bundle representation',
	task: () => {
		madge(entry, config).then((res) => {
			const json = JSON.stringify(res.obj(), null, ' ');

			fs.writeFileSync(graphFile, json);
		});
	},
	graphFile,
};
