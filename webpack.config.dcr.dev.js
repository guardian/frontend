/* eslint-disable import/no-extraneous-dependencies */

const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = require('./webpack.config.dcr.js');

module.exports = webpackMerge.smart(config, {
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        filename: `[name]/graun.commercial.dcr.js`,
        chunkFilename: `[name]/graun.commercial.dcr.js`,
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: `[name]/graun.commercial.dcr.css`,
            chunkFilename: `[name]/graun.commercial.dcr.css`,
        }),
    ],
});
