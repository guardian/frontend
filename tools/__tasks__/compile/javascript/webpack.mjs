import Observable from 'any-observable/register/rxjs-all.js';

import webpack from 'webpack';
import chalk from 'chalk';

import webpackConfigProd from '../../../../webpack.config.prod.mjs';

const { red } = chalk;

export default {
	description: 'Create Webpack bundles',
	task: () => {
		return new Observable((observer) => {
			plugins = [
				require('../../../webpack-progress-reporter.js')(observer),
				...webpackConfigProd.plugins,
			];

			const bundler = webpack(config);

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
		});
	},
};
