// eslint-disable-next-line import/no-unassigned-import
require('any-observable/register/rxjs-all');

const Observable = require('any-observable');

const webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const Visualizer = require('webpack-visualizer-plugin');
const BundleAnalyzerPlugin = require(
    'webpack-bundle-analyzer'
).BundleAnalyzerPlugin;
const chalk = require('chalk');

module.exports = {
    description: 'Create Webpack bundles',
    task: () => new Observable(observer => {
        const config = require('../../../../webpack.config.js')({
            env: 'production',
            plugins: [
                new webpack.optimize.AggressiveMergingPlugin({
                    // delicate number: stops enhanced-no-commercial and enhanced
                    // being merged into one
                    minSizeReduce: 1.6,
                }),
                new Visualizer({
                    filename: './webpack-stats.html',
                }),
                new BundleAnalyzerPlugin({
                    reportFilename: './bundle-analyzer-report.html',
                    analyzerMode: 'static',
                    openAnalyzer: false,
                }),
                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': JSON.stringify('production'),
                }),
                new webpack.optimize.UglifyJsPlugin({
                    sourceMap: true,
                }),
                new ProgressPlugin((progress, msg) =>
                    observer.next(`${Math.round(progress * 100)}% ${msg}`)),
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
