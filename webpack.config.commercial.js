const path = require('path');
const webpackMerge = require('webpack-merge');
const config = require('./webpack.config.js');

const standaloneEntry = 'commercial-standalone';
if (Object.keys(config.entry).includes(standaloneEntry))
	throw new Error(`Conflicting entry name: ${standaloneEntry}`);

// override JS entry points
config.entry = {
	[standaloneEntry]: path.join(
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
		/**
		 * To prevent clashes with the main bundle, the JSONP loading function
		 * needs to be assigned a unique name.
		 *
		 * Typical errors were “Cannot read property `call` of undefined”
		 *
		 * **Wepback 4 only.** Renamed in Wepback 5 `chunkLoadingGlobal`
		 */
		jsonpFunction: 'commercialJsonp',
		path: path.join(
			__dirname,
			'static',
			'target',
			'javascripts',
			'commercial',
		),
	},
	resolve: {
		alias: {
			lodash: 'lodash',
		},
	},
});
