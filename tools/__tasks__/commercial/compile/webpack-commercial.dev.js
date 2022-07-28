require('any-observable/register/rxjs-all');

const Observable = require('any-observable');

const webpack = require('webpack');
const chalk = require('chalk');

const config = require('../../../../webpack.config.commercial.dev.js');

module.exports = {
	description: 'Create Webpack standalone.commercial.js bundle for development',
	task: () =>
		new Observable((observer) => {
			config.plugins = [
				require('../../../webpack-progress-reporter')(observer),
				...config.plugins,
			];

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
