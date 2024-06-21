import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { smart } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';

import config from './webpack.config.mjs';

console.info("dirname", dirname(fileURLToPath(import.meta.url)))

export default smart(config, {
	// Blatantly override JS entry points
	entry: {
		snippet: join(
			dirname(fileURLToPath(import.meta.url)),
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
