/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const config = require('./webpack.config.js');


// override JS entry points
config.entry = {
    javascripts: path.join(
        __dirname,
        'static',
        'src',
        'javascripts',
        'bootstraps',
        'commercial.dcr.js'
    ),
    stylesheets: path.join(
        __dirname,
        'static',
        'src',
        'stylesheets',
        'module',
        'commercial',
        '_creatives-dcr.scss',
    ),
};

module.exports = webpackMerge.smart(config, {
    output: {
        path: path.join(__dirname, 'static', 'target'),
    },
});
