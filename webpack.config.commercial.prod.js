const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const Visualizer = require('webpack-visualizer-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
	.BundleAnalyzerPlugin;
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const config = require('./webpack.config.commercial.js');

module.exports = webpackMerge.smart(config, {
	mode: 'production',
	output: {
		filename: `[chunkhash]/graun.standalone.commercial.js`,
		chunkFilename: `[chunkhash]/graun.[name].commercial.js`,
	},
	devtool: 'source-map',
	plugins: [
		new Visualizer({
			filename: './commercial-webpack-stats.html',
		}),
		new BundleAnalyzerPlugin({
			reportFilename: './commercial-bundle-analyzer-report.html',
			analyzerMode: 'static',
			openAnalyzer: false,
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		new UglifyJSPlugin({
			parallel: true,
			sourceMap: true,
		}),
	],
});
