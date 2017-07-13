// @flow
const path = require('path');
const webpackMerge = require('webpack-merge');

const { ui, main } = require('./paths');

const config = {
    output: {
        filename: '[name].js',
        chunkFilename: `[name].js`,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'styletron-loader' },
                    {
                        loader: 'sass-loader',
                        options: {
                            // prepended to all sass files
                            data: `
                                @import '~sass-mq/_mq';
                            `,
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        modules: [
            path.resolve(ui, 'src'),
            path.resolve(ui, 'src', 'app'),
            'node_modules', // default location, but we're overiding above, so it needs to be explicit
        ],
        extensions: ['.js', '.jsx'],
    },
};

module.exports = [
    webpackMerge.smart(config, {
        entry: {
            'ui.bundle.server': [path.join(ui, 'src', 'boot.server.jsx')],
        },
        output: {
            library: 'frontend',
            libraryTarget: 'this',
            path: path.join(ui, 'dist'),
        },
    }),
    webpackMerge.smart(config, {
        entry: {
            'ui.bundle.browser': [path.join(ui, 'src', 'boot.browser.jsx')],
        },
        output: {
            path: path.join(main, 'static', 'target', 'javascripts'),
        },
    }),
];
