/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const config = require('./webpack.config.js');

// override JS entry points
config.entry = {
    'commercial': path.join(
        __dirname,
        'static',
        'src',
        'javascripts',
        'bootstraps',
        'commercial.dcr.js'
    ),
};

module.exports = webpackMerge.smart(config, {
    output: {
        path: path.join(__dirname, 'static', 'target', 'javascripts'),
    },
});
