// this is the main way in for webpack config.
// pass env.server or env.browser for specific envs.

const path = require('path');

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const { ui } = require('./paths');

const cssLoader = {
    loader: 'css-loader',
    options: {
        minimize: true,
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
                use: ['babel-loader', 'guui-svg-loader'],
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                oneOf: [
                    {
                        test: /(\/__inline__)/,
                        use: ['raw-loader', 'babel-loader'],
                    },
                    {
                        use: ['babel-loader'],
                    },
                ],
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                oneOf: [
                    {
                        test: /(\/__inline__)/,
                        use: ['to-string-loader', cssLoader],
                    },
                    {
                        use: ['guui-css-loader'],
                    },
                ],
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
    resolveLoader: {
        modules: [
            path.resolve(
                'node_modules',
                '@guardian',
                'guui',
                'dist',
                'lib',
                'loaders'
            ),
            path.resolve(
                '..',
                'node_modules',
                '@guardian',
                'guui',
                'dist',
                'lib',
                'loaders'
            ),
            'node_modules',
        ],
    },
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
