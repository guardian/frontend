// this is the main way in for webpack config.
// pass env.server or env.browser for specific envs.

const path = require('path');

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const { ui } = require('./paths');

const pasteupSass = require('../__tools__/pasteup-sass');

const cssLoader = {
    loader: 'css-loader',
    options: {
        minimize: true,
    },
};

const sassLoader = {
    loader: 'sass-loader',
    options: {
        // prepended to all sass files
        data: `
            @import '~sass-mq/_mq';
            @import 'pasteup';
        `,
        importer: [
            url => (url === 'pasteup' ? { contents: pasteupSass } : null),
        ],
    },
};

const config = {
    output: {
        filename: '[name].js',
        chunkFilename: `[name].js`,
    },
    module: {
        rules: [
            {
                test: /\.svg$/,
                use: ['babel-loader', 'svg-loader'],
            },
            {
                test: /\.(js|jsx)$/,
                oneOf: [
                    {
                        test: /(\/__inline__)/,
                        exclude: /node_modules/,
                        use: ['raw-loader', 'babel-loader'],
                    },
                    {
                        exclude: /node_modules/,
                        use: ['babel-loader'],
                    },
                ],
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ['to-string-loader', cssLoader],
            },
            {
                test: /\.js\.scss$/,
                exclude: /node_modules/,
                use: ['styletron-loader', sassLoader],
            },
        ],
    },
    resolve: {
        modules: [
            path.resolve(ui, 'src'),
            'node_modules', // default location, but we're overiding above, so it needs to be explicit
        ],
        extensions: ['.js', '.jsx'],
        alias: {
            // some libs expect react, this stops them bundling it
            react: 'preact',
        },
    },
    resolveLoader: { modules: [path.resolve(ui, '__tools__'), 'node_modules'] },
    watchOptions: { ignored: /node_modules/ },
};

module.exports = (env = { server: true }) => {
    if (env.server) {
        return webpackMerge.smart(config, {
            entry: {
                'ui.bundle.server': [
                    'core-js/es6',
                    path.join(ui, 'src', 'index.server.jsx'),
                ],
            },
            output: {
                library: 'frontend',
                libraryTarget: 'this',
                path: path.join(ui, 'dist'),
            },
            plugins: [
                new webpack.DefinePlugin({ BROWSER: false, SERVER: true }),
            ],
        });
    }
    if (env.browser) {
        return webpackMerge.smart(config, {
            entry: {
                'ui.bundle.browser': [
                    path.join(ui, 'src', 'index.browser.jsx'),
                ],
            },
            output: {
                publicPath: '/assets/javascripts/',
            },
            plugins: [
                new webpack.DefinePlugin({ BROWSER: true, SERVER: false }),
            ],
        });
    }
    return config;
};
