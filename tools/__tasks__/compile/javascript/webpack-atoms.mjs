import { Observable } from 'rxjs';
import webpack from 'webpack';
import chalk from 'chalk';

import webpackConfigAtoms from '../../../../webpack.config.atoms.mjs';
import { reporter } from './webpack-progress-reporter.mjs';

const { red } = chalk;

export default {
	description: 'Create Webpack bundles for atoms',
	task: () => new Observable((observer) => {
			const bundler = webpack({
			 ...webpackConfigAtoms.config,
				plugins: [
				  reporter(observer),
					...webpackConfigAtoms.plugins,
				]
			});

			bundler.run((err, stats) => {
				if (err) {
					throw new Error(red(err));
				}
				const info = stats.toJson();
				if (stats.hasErrors()) {
					throw new Error(red(JSON.stringify(info.errors)));
				}
				observer.complete();
			});
		})
};
