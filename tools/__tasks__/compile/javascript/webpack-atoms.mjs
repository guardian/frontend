import 'any-observable/register/rxjs-all';

import Observable from 'any-observable';

import webpack from 'webpack';
import chalk from 'chalk';

import config, { plugins } from '../../../../webpack.config.atoms.js';

const { red } = chalk;

export default {
	description: 'Create Webpack bundles for atoms',
	task: () => {
		return new Observable((observer) => {
			plugins = [
				require('../../../webpack-progress-reporter.js')(observer),
				...plugins,
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
