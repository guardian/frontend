/* eslint-disable import/no-extraneous-dependencies */

const webpackMerge = require('webpack-merge');

const config = require('./webpack.config.js');

module.exports = webpackMerge.smart(config, {
    devtool: 'inline-source-map',
    output: {
        filename: `graun.[name].js`,
        chunkFilename: `graun.[name].js`,
    },
});
