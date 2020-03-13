/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
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
    resolve: {
        alias: {
            'lib/report-error': 'lib/dotcom-rendering/report-error'
        }
    }
});
