require('any-observable/register/rxjs-all');

const Observable = require('any-observable');

const webpack = require('webpack');
const chalk = require('chalk');

const config = require('../../../../webpack.config.prod.js');
const reporter = require('../../../webpack-progress-reporter.js');

const task = {
	description: 'Create Webpack bundles',
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
					throw new Error(chalk.red(info.errors));
				}
				observer.complete();
			});
		}),
};

module.exports = task;
