// eslint-disable-next-line import/no-unassigned-import
require('any-observable/register/rxjs-all');

const Observable = require('any-observable');

const webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const Visualizer = require('webpack-visualizer-plugin');
const chalk = require('chalk');

module.exports = {
    description: 'Create Webpack bundles',
    task: () => new Observable((observer) => {
        const config = require('../../../../webpack.config.js')({
            env: 'production',
            plugins: [
                new webpack.optimize.AggressiveMergingPlugin(),
                new Visualizer({
                    filename: './webpack-stats.html',
                }),
                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': JSON.stringify('production'),
                }),
                new webpack.optimize.UglifyJsPlugin({
                    sourceMap: true,
                }),
                new ProgressPlugin((progress, msg) => observer.next(`${Math.round(progress * 100)}% ${msg}`)),
            ],
        });
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
