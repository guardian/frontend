const path = require('path');
const webpackMerge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

const config = require('./webpack.config.js');

// Blatantly override JS entry points
config.entry = {
	snippet: path.join(
		__dirname,
		'static',
		'src',
		'javascripts',
		'bootstraps',
		'atoms',
		'snippet.js',
	),
};

module.exports = webpackMerge.smart(config, {
	devtool: 'source-map',
	output: {
		filename: `[chunkhash]/graun.[name].js`,
		chunkFilename: `[chunkhash]/graun.[name].js`,
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
					sourceMap: true,
				},
			}),
		],
	},
});
