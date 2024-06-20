import webpack from 'webpack';
import { smart } from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import TerserPlugin from 'terser-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

import config from './webpack.config.mjs';

export default smart(config, {
	mode: 'production',
	output: {
		filename: `[chunkhash]/graun.[name].js`,
		chunkFilename: `[chunkhash]/graun.[name].js`,
		clean: true,
	},
	devtool: 'source-map',
	plugins: [
		// Copy the commercial bundle dist to Frontend's static output location:
		// static/target/javascripts/commercial
		new CopyPlugin({
			patterns: [
				{
					from: 'node_modules/@guardian/commercial/dist/bundle/prod',
					to: 'commercial',
				},
			],
		}),
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
