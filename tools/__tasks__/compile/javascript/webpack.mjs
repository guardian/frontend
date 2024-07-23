import { Observable } from 'rxjs';
import webpack from 'webpack';
import chalk from 'chalk';

import config from '../../../../webpack.config.prod.js';
import reporter from '../../../webpack-progress-reporter.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Create Webpack bundles',
	task: () =>
		new Observable((observer) => {
			config.plugins = [reporter(observer), ...config.plugins];

			const bundler = webpack(config);

			bundler.run((err, stats) => {
				if (err) {
					throw new Error(chalk.red(err));
				}
				const info = stats.toJson();
				if (stats.hasErrors()) {
					throw new Error(chalk.red(JSON.stringify(info.errors)));
				}
				observer.complete();
			});
		}),
};

export default task;
