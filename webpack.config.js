/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');

const webpack = require('webpack');

const outputName = 'app-webpack';

module.exports = ({ env = 'dev', plugins = [] } = {}) => ({
    devtool: env === 'dev' ? 'inline-source-map' : 'source-map',
    entry: path.join(__dirname, 'static', 'src', 'javascripts', 'boot-webpack.js'),
    output: {
        path: path.join(__dirname, 'static', 'target', 'javascripts'),
        filename: `${env === 'dev' ? '' : '[chunkhash]/'}${outputName}.js`,
        chunkFilename: `${env === 'dev' ? '' : '[chunkhash]/'}${outputName}.chunk-[id].js`,
    },
    resolve: {
        modules: [
            path.join(__dirname, 'static', 'src', 'javascripts'),
            path.join(__dirname, 'static', 'src', 'javascripts-legacy'),
            path.join(__dirname, 'static', 'vendor', 'javascripts'),
            'node_modules', // default location, but we're overiding above, so it needs to be explicit
        ],
        alias: {
            admin: 'projects/admin',
            common: 'projects/common',
            facia: 'projects/facia',
            membership: 'projects/membership',
            commercial: 'projects/commercial',

            // #wp-rjs weird old aliasing from requirejs
            lodash: 'lodash-amd/compat',
            picturefill: 'projects/common/utils/picturefill',
            Promise: 'when/es6-shim/Promise',
            raven: 'raven-js',
            EventEmitter: 'wolfy87-eventemitter',
            videojs: 'video.js',
            'videojs-ads-lib': 'videojs-contrib-ads',

            stripe: 'stripe/stripe.min',
            svgs: path.join(__dirname, 'static', 'src', 'inline-svgs'),
            'ophan/ng': 'ophan-tracker-js',
            'ophan/embed': 'ophan-tracker-js/build/ophan.embed',

            // #wp-rjs once r.js is gone, these can be unaliased and modules updated
            react: 'react/addons',
        },
    },
    resolveLoader: {
        alias: {
            // #wp-rjs
            // these are only needed while require is still present
            // should be updated once removed to be more wepback-like
            text: 'raw-loader',
            inlineSvg: 'svg-loader',
        },
        modules: [
            path.resolve(__dirname, 'tools', 'webpack-loaders'),
            'node_modules',
        ],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|vendor|javascripts-legacy)/,
                loader: 'babel-loader',
            },
        ],
    },
    plugins: [
        // Makes videosjs available to all modules in the videojs chunk.
        // videojs plugins expect this object to be available globally,
        // but it's sufficient to scope it at the chunk level
        new webpack.ProvidePlugin({
            videojs: 'videojs',
        }),
        // optional plugins passed in in production
        ...plugins,
    ],
    externals: {
        xhr2: {},
    },
});
