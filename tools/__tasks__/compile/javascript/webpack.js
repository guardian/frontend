// eslint-disable-next-line import/no-unassigned-import
require('any-observable/register/rxjs-all');

const Observable = require('any-observable');

const webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const chalk = require('chalk');

module.exports = {
    description: 'Create Webpack bundles',
    task: () => new Observable((observer) => {
        const bundler = webpack(require('../../../../webpack.config.js'));
        bundler.apply(new ProgressPlugin((progress, msg) => observer.next(`${Math.round(progress * 100)}% ${msg}`)));

        // set equivalents to -p flag
        bundler.apply(new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }));
        bundler.apply(new webpack.optimize.OccurrenceOrderPlugin(true));
        bundler.apply(new webpack.optimize.UglifyJsPlugin());

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
