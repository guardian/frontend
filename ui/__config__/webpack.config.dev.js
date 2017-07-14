const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const commonConfig = require('./webpack.config.js');
const { ui } = require('./paths');

const stats = {
    assets: false,
    assetsSort: 'field',
    cached: false,
    cachedAssets: false,
    children: false,
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    chunksSort: 'field',
    colors: true,
    depth: false,
    entrypoints: false,
    errors: true,
    errorDetails: true,
    exclude: [],
    hash: false,
    maxModules: 15,
    modules: false,
    modulesSort: 'field',
    moduleTrace: false,
    performance: false,
    providedExports: false,
    publicPath: false,
    reasons: false,
    source: false,
    timings: true,
    usedExports: false,
    version: false,
    warnings: true,
};

module.exports = env => {
    const config = commonConfig(env);

    if (env.server) {
        return webpackMerge.smart(config, {
            watch: true,
            stats,
        });
    }

    if (env.browser) {
        return webpackMerge.smart(config, {
            entry: {
                'bundle.browser': ['webpack-hot-middleware/client?reload=true'],
            },
            output: {
                path: path.join(ui, 'dist'),
            },
            devtool: 'inline-source-map',
            plugins: [new webpack.HotModuleReplacementPlugin()],
            devServer: {
                publicPath: '/assets/javascripts/',
                compress: true,
                port: 3000,
                overlay: true,
                proxy: {
                    '/render/js': 'http://localhost:9000',
                },
                hot: true,
                stats,
            },
        });
    }

    return config;
};
