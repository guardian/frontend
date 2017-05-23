/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const webpackMerge = require('webpack-merge');

const config = require('./webpack.config.js');

// Blatantly override JS entry points
config.entry = {
    storyquestions: path.join(
        __dirname,
        'static',
        'src',
        'javascripts',
        'bootstraps',
        'atoms',
        'storyquestions.js'
    ),
};

module.exports = webpackMerge.smart(config, {
    devtool: 'inline-source-map',
    output: {
        filename: `graun.[name].js`,
        chunkFilename: `graun.[name].js`,
    },
});
