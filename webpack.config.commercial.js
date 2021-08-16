const path = require('path');
const webpackMerge = require('webpack-merge');
const config = require('./webpack.config.js');

// override JS entry points
config.entry = {
	'commercial-standalone': path.join(
		__dirname,
		'static',
		'src',
		'javascripts',
		'bootstraps',
		'standalone.commercial.ts',
	),
};

module.exports = webpackMerge.smart(config, {
	output: {
		path: path.join(
			__dirname,
			'static',
			'target',
			'javascripts',
			'commercial',
		),
	},
});
