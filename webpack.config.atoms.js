/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const webpackMerge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const webpackConfig =require('./webpack.config.js');
const config = webpackConfig()

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
    snippet: path.join(
        __dirname,
        'static',
        'src',
        'javascripts',
        'bootstraps',
        'atoms',
        'snippet.js'
    ),
};

module.exports = webpackMerge.smart(config, {
    devtool: 'source-map',
    output: {
        filename: `[chunkhash]/graun.[name].js`,
        chunkFilename: `[chunkhash]/graun.[name].js`,
    },
    plugins: [
        new UglifyJSPlugin({
            parallel: true,
            sourceMap: true,
        }),
    ],
});
