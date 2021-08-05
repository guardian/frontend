const webpackMerge = require('webpack-merge');
const config = require('./webpack.config.commercial.js');

module.exports = webpackMerge.smart(config, {
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        filename: `graun.[name].commercial.js`,
        chunkFilename: `graun.[name].commercial.js`,
    },
});
