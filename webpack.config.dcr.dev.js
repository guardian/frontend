

const webpackMerge = require('webpack-merge');

const config = require('./webpack.config.dcr.js');

module.exports = webpackMerge.smart(config, {
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        filename: `graun.[name].dcr.js`,
        chunkFilename: `graun.[name].dcr.js`,
    },
});
