/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const webpackMerge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const config = require('./webpack.config.js');

// override JS entry points
config.entry = {
    'dotcom-rendering-commercial': path.join(
        __dirname,
        'static',
        'src',
        'javascripts',
        'bootstraps',
        'dotcom-rendering-commercial.js'
    ),
};

module.exports = webpackMerge.smart(config, {
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        filename: `graun.dotcom-rendering-commercial.js`,
        chunkFilename: `graun.dotcom-rendering-commercial.js`,
    },
    resolve: {
        alias: {
            'lib/report-error': 'lib/dotcom-rendering/report-error'
        }
    }
});
