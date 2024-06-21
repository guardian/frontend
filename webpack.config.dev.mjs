import { smart } from 'webpack-merge';
import config from './webpack.config.mjs';
import CopyPlugin from 'copy-webpack-plugin';

export default smart(config, {
	devtool: 'inline-source-map',
	mode: 'development',
	output: {
		filename: `graun.[name].js`,
		chunkFilename: `graun.[name].js`,
		clean: true,
	},
	plugins: [
		// Copy the commercial bundle dist to Frontend's static output location:
		// static/target/javascripts/commercial
		// In development mode the hashed directory structure is discarded and all files are copied to '/commercial'
		new CopyPlugin({
			patterns: [
				{
					from: 'node_modules/@guardian/commercial/dist/bundle/dev',
					to: 'commercial',
				},
			],
		}),
	],
});
