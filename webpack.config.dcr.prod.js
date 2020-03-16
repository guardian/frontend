/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const Visualizer = require('webpack-visualizer-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const config = require('./webpack.config.dcr.js');

module.exports = webpackMerge.smart(config, {
    mode: 'production',
    output: {
        filename: `[chunkhash]/graun.[name].js`,
        chunkFilename: `[chunkhash]/graun.[name].js`,
    },
    devtool: 'source-map',
    plugins: [
        new Visualizer({
            filename: './dcr-webpack-stats.html',
        }),
        new BundleAnalyzerPlugin({
            reportFilename: './dcr-bundle-analyzer-report.html',
            analyzerMode: 'static',
            openAnalyzer: true,
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new UglifyJSPlugin({
            parallel: true,
            sourceMap: true,
        }),
    ],
});
