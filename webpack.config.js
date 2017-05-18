/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        standard: path.join(
            __dirname,
            'static',
            'src',
            'javascripts',
            'boot.js'
        ),
        admin: path.join(
            __dirname,
            'static',
            'src',
            'javascripts',
            'bootstraps',
            'admin.js'
        ),
        'video-embed': path.join(
            __dirname,
            'static',
            'src',
            'javascripts-legacy',
            'bootstraps',
            'video-embed.js'
        ),
        'youtube-embed': path.join(
            __dirname,
            'static',
            'src',
            'javascripts-legacy',
            'bootstraps',
            'youtube-embed.js'
        ),
    },
    output: {
        path: path.join(__dirname, 'static', 'target', 'javascripts'),
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
            picturefill: 'lib/picturefill',
            raven: 'raven-js',
            EventEmitter: 'wolfy87-eventemitter',
            videojs: 'video.js',

            stripe: 'stripe/stripe.min',
            svgs: path.join(__dirname, 'static', 'src', 'inline-svgs'),
            'ophan/ng': 'ophan-tracker-js',
            'ophan/embed': 'ophan-tracker-js/build/ophan.embed',
        },
    },
    resolveLoader: {
        modules: [
            path.resolve(__dirname, 'dev', 'webpack-loaders'),
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
            {
                test: /\.svg$/,
                exclude: /(node_modules)/,
                loader: 'svg-loader',
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
    ],
    externals: {
        xhr2: {},
    },
};
