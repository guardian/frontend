const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const BundleAnalyzerPlugin =
	require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

const config = require('./webpack.config.js');

module.exports = webpackMerge.smart(config, {
	mode: 'production',
	output: {
		filename: `[chunkhash]/graun.[name].js`,
		chunkFilename: `[chunkhash]/graun.[name].js`,
		clean: true,
	},
	devtool: 'source-map',
	plugins: [
		new webpack.optimize.AggressiveMergingPlugin({
			// delicate number: stops enhanced-no-commercial and enhanced
			// being merged into one
			minSizeReduce: 1.6,
		}),
		new BundleAnalyzerPlugin({
			reportFilename: './bundle-analyzer-report.html',
			analyzerMode: 'static',
			openAnalyzer: false,
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
	],
	optimization: {
		minimizer: [
			new TerserPlugin({
				exclude: /graun.*commercial.js/,
				parallel: true,
				terserOptions: {
					sourceMap: true,
				},
			}),
		],
	},
});
