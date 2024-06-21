import { Observable } from 'rxjs';
import webpack from 'webpack';
import chalk from 'chalk';
import webpackConfigProd from '../../../../webpack.config.prod.mjs';
import { reporter } from './webpack-progress-reporter.mjs';

const { red } = chalk;

export default {
	description: 'Create Webpack bundles',
	task: () => new Observable(observer => {

		const bundler = webpack({
   	  ...webpackConfigProd,
     	plugins: [
     	  reporter(observer),
        ...webpackConfigProd.plugins,
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
			observer.complete()
		});
	})
};
