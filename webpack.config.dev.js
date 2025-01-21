const webpackMerge = require('webpack-merge');
const config = require('./webpack.config.js');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = webpackMerge.smart(config, {
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        filename: `graun.[name].js`,
        chunkFilename: `graun.[name].js`,
        clean: true,
    }
});
