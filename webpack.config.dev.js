const webpackMerge = require('webpack-merge');
const config = require('./webpack.config.js');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = webpackMerge.smart(config, {
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        filename: `graun.[name].js`,
        chunkFilename: `graun.[name].js`,
    },
    plugins: [
        // Copy the commercial bundle dist to Frontend's static output location:
        // static/target/javascripts/commercial
        // In development mode the hashed directory structure is discarded and all files are copied to '/commercial'
        new CopyPlugin({
            patterns: [
              {
                  from: "node_modules/@guardian/commercial-bundle/dist",
                  to: "commercial/[name].[ext]"
              },
            ],
        }),
    ],
});
