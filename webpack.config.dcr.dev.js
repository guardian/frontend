/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const webpackMerge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const config = require('./webpack.config.dcr.js');

module.exports = webpackMerge.smart(config, {
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        filename: `graun.[name].js`,
        chunkFilename: `graun.[name].js`,
    },
});
