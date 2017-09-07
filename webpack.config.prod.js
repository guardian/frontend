/* eslint-disable import/no-extraneous-dependencies */

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const Visualizer = require('webpack-visualizer-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const config = require('./webpack.config.js');

module.exports = webpackMerge.smart(config, {
    output: {
        filename: `[chunkhash]/graun.[name].js`,
        chunkFilename: `[chunkhash]/graun.[name].js`,
    },
    devtool: 'source-map',
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
        new UglifyJSPlugin({
            parallel: true,
            sourceMap: true,
        }),
    ],
});
