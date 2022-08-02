const webpackMerge = require('webpack-merge');
const config = require('./webpack.config.commercial.js');

const port = 3031;

module.exports = webpackMerge.smart(config, {
	/** @type {import('webpack-dev-server').Configuration} */
	devtool: 'inline-source-map',
	mode: 'development',
	output: {
		filename: `graun.standalone.commercial.js`,
		chunkFilename: `graun.[name].commercial.js`,
	},
	devServer: {
		port,
		compress: false,
		hot: false,
		liveReload: true,
	},
});
