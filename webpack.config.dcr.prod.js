/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const Visualizer = require('webpack-visualizer-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('./webpack.config.dcr.js');

module.exports = webpackMerge.smart(config, {
    mode: 'production',
    output: {
        filename: `[name]/[chunkhash]/graun.commercial.dcr.js`,
        chunkFilename: `[name]/[chunkhash]/graun.commercial.dcr.js`,
    },
    devtool: 'source-map',
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
        new Visualizer({
            filename: './dcr-webpack-stats.html',
        }),
        new BundleAnalyzerPlugin({
            reportFilename: './dcr-bundle-analyzer-report.html',
            analyzerMode: 'static',
            openAnalyzer: false,
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new UglifyJSPlugin({
            parallel: true,
            sourceMap: true,
        }),
        new MiniCssExtractPlugin({
            filename: `[name]/[chunkhash]/graun.commercial.dcr.css`,
            chunkFilename: `[name]/[chunkhash]/graun.commercial.dcr.css`,
            sourceMap: false,
        }),
    ],
});
