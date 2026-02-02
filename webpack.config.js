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
        // Old VideoJS embed
        'videojs-embed': path.join(
            __dirname,
            'static',
            'src',
            'javascripts',
            'bootstraps',
            'videojs-embed.js'
        ),
        // Video embed with native video player enhancements
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
            'youtube-embed.ts'
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
            journalism: 'projects/journalism',

            // #wp-rjs weird old aliasing from requirejs
            videojs: 'video.js',

            svgs: path.join(__dirname, 'static', 'src', 'inline-svgs'),
            'ophan/ng': 'ophan-tracker-js',
            'ophan/embed': 'ophan-tracker-js/build/ophan.embed',
            lodash: 'lodash-es',
            "react": "preact/compat",
            "react-dom/test-utils": "preact/test-utils",
            "react-dom": "preact/compat",
        },
        extensions: ['.js', '.ts', '.tsx', '.jsx'],
        symlinks: false, // Inserted to enable linking @guardian/consent-management-platform
    },
    resolveLoader: {
        modules: [
            path.resolve(__dirname, 'dev', 'webpack-loaders'),
            path.resolve(
                __dirname,
                'node_modules',
                '@guardian',
                'node_modules'
            ),
            'node_modules',
        ],
    },
    module: {
        rules: [
            {
                test: /\.[jt]sx?|mjs$/,
                exclude: {
                    or: [/node_modules/, path.resolve(__dirname, 'static/vendor')],
                    not: [
                        // Include all @guardian modules, except automat-modules
                        /@guardian\/(?!(automat-modules|automat-contributions))/,
                        // Include the dynamic-import-polyfill
                        /dynamic-import-polyfill/,
                    ],
                },
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    },
                ]
            },
            {
                test: /\.svg$/,
                exclude: /(node_modules)/,
                loader: 'svg-loader',
            },
            {
                test: /\.(html|css)$/,
                exclude: /(node_modules)/,
                loader: 'raw-loader',
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
