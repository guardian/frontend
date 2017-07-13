// @flow
const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;

const { root } = require('./paths');
const [server, browser] = require('./webpack.config.js');

module.exports = [
    webpackMerge.smart(server, {
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
        ],
    }),
    webpackMerge.smart(browser, {
        devtool: 'sourcemap',
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
            }),
            new BundleAnalyzerPlugin({
                defaultSizes: 'gzip',
                reportFilename: path.join(
                    root,
                    'dist',
                    'bundle.browser.stats.html'
                ),
                analyzerMode: 'static',
                openAnalyzer: false,
            }),
        ],
    }),
];
