const webpackMerge = require('webpack-merge');
const config = require('./webpack.config.js');

module.exports = webpackMerge.smart(config, {
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        filename: `graun.[name].js`,
        chunkFilename: `graun.[name].js`,
        clean: true,
    }
});
