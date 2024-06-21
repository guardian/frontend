import { Observable } from 'rxjs';
import webpack from 'webpack';
import chalk from 'chalk';

import webpackDevConfig from '../../../../webpack.config.dev.js';
import { reporter } from './webpack-progress-reporter.mjs';

const { red } = chalk;

export default {
	description: 'Create Webpack bundles',
	task: () => new Observable((observer) => {

		const bundler = webpack({
		  ...webpackDevConfig,
				plugins: [
				  reporter(observer),
				...webpackDevConfig.plugins,
				]
		});

		bundler.run((err, stats) => {
			if (err) {
				throw new Error(red(err));
			}
			const info = stats.toJson();
			if (stats.hasErrors()) {
				throw new Error(red(info.errors));
			}
			observer.complete();
		});
	})
};
