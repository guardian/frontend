/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');
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
            'javascripts',
            'bootstraps',
            'video-embed.js'
        ),
        'youtube-embed': path.join(
            __dirname,
            'static',
            'src',
            'javascripts',
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
            path.join(__dirname, 'static', 'vendor', 'javascripts'),
            'node_modules', // default location, but we're overiding above, so it needs to be explicit
        ],
        alias: {
            admin: 'projects/admin',
            common: 'projects/common',
            facia: 'projects/facia',
            membership: 'projects/membership',
            commercial: 'projects/commercial',
            'commercial-control': 'projects/commercial-control',
            journalism: 'projects/journalism',

            // #wp-rjs weird old aliasing from requirejs
            lodash: 'lodash-node/compat',
            raven: 'raven-js',
            EventEmitter: 'wolfy87-eventemitter',
            videojs: 'video.js',

            svgs: path.join(__dirname, 'static', 'src', 'inline-svgs'),
            'ophan/ng': 'ophan-tracker-js',
            'ophan/embed': 'ophan-tracker-js/build/ophan.embed',
        },
    },
    resolveLoader: {
        modules: [
            path.resolve(__dirname, 'dev', 'webpack-loaders'),
            // TODO: atom-renderer's loaders are actually dependencies of frontend, not atom-renderer
            // They should be listed as peerDependencies in atom-renderer
            // https://github.com/guardian/atom-renderer/issues/41
            path.resolve(__dirname, 'node_modules', '@guardian', 'atom-renderer', 'node_modules'),
            'node_modules',
        ],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|vendor)/,
                loader: 'babel-loader',
            },
            {
                test: /\.svg$/,
                exclude: /(node_modules)/,
                loader: 'svg-loader',
            },
            // Atoms rely on locally defined variables (see atoms/vars.scss)
            // to exhibit the same styles of the underlying platform. This
            // module below exposes a loader that catches requests for
            // atoms's CSS and automatically swaps in values for these variables
            ...require('@guardian/atom-renderer/webpack/css')({
                cssVarsPath: path.join(__dirname, 'static', 'src', 'stylesheets', 'atoms', 'vars.scss')
            }),
        ],
    },
    plugins: [
        // Makes videosjs available to all modules in the videojs chunk.
        // videojs plugins expect this object to be available globally,
        // but it's sufficient to scope it at the chunk level
        new webpack.ProvidePlugin({
            videojs: 'videojs',
        }),

        new CircularDependencyPlugin({
            // exclude detection of files based on a RegExp
            exclude: /node_modules/,
            // add errors to webpack instead of warnings
            failOnError: true,
        }),

        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
    ],
    externals: {
        xhr2: {},
    },
};
