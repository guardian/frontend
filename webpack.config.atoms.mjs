import { join } from 'path';
import { smart } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';

import config from './webpack.config.mjs';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); //

export default smart(config, {
	// Blatantly override JS entry points
	entry: {
		snippet: join(
			__dirname,
			'static',
			'src',
			'javascripts',
			'bootstraps',
			'atoms',
			'snippet.js',
		),
	},
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
