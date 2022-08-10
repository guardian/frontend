const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const config = require('./webpack.config.commercial.js');

const port = 3031;
const overrideBundlePath = `http://localhost:${port}`;
const shouldOverrideBundle = !!process.env.OVERRIDE_BUNDLE;

module.exports = webpackMerge.smart(config, {
	/** @type {import('webpack-dev-server').Configuration} */
	devtool: 'inline-source-map',
	mode: 'development',
	output: {
		filename: `graun.standalone.commercial.js`,
		chunkFilename: `graun.[name].commercial.js`,
	},
	plugins: shouldOverrideBundle
		? [
				new webpack.DefinePlugin({
					'process.env.OVERRIDE_BUNDLE_PATH':
						JSON.stringify(overrideBundlePath),
				}),
		  ]
		: [],
	devServer: {
		port,
		compress: true,
		hot: false,
		liveReload: true,
	},
});
