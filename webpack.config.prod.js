/* eslint-disable import/no-extraneous-dependencies */

const webpack = require('webpack');
const Visualizer = require('webpack-visualizer-plugin');

const config = require('./webpack.config.js');

config.plugins = [
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
    ...config.plugins,
];

module.exports = config;
