const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const { ui } = require('./paths');

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
    watchOptions: { ignored: /node_modules/ },
};

module.exports = env => {
    if (env.server) {
        return webpackMerge.smart(config, {
            entry: {
                'ui.bundle.server': [path.join(ui, 'src', 'boot.server.jsx')],
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
                'ui.bundle.browser': [path.join(ui, 'src', 'boot.browser.jsx')],
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
