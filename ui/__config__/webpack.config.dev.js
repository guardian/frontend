// @flow

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const [server, browser] = require('./webpack.config.js');

module.exports = [
    server,
    webpackMerge.smart(browser, {
        entry: {
            'bundle.browser': ['webpack-hot-middleware/client?reload=true'],
        },
        devtool: 'inline-source-map',
        plugins: [new webpack.HotModuleReplacementPlugin()],
    }),
];
