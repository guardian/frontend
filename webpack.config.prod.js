/* eslint-disable import/no-extraneous-dependencies */

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const Visualizer = require('webpack-visualizer-plugin');

const config = require('./webpack.config.js');

module.exports = webpackMerge.smart(config, {
    output: {
        filename: `[chunkhash]/graun.[name].js`,
        chunkFilename: `[chunkhash]/graun.[name].js`,
    },
    devtool: 'source-map',
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
    ],
});
