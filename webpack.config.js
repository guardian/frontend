/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');

const webpack = require('webpack');

const outputName = 'app-webpack';

module.exports = ({ env = 'dev', plugins = [] } = {}) => ({
    devtool: env === 'dev' ? 'inline-source-map' : 'source-map',
    entry: {
        [outputName]: path.join(__dirname, 'static', 'src', 'javascripts', 'boot-webpack.js'),
        admin: path.join(__dirname, 'static', 'src', 'javascripts-legacy', 'bootstraps', 'admin.js'),
    },
    output: {
        path: path.join(__dirname, 'static', 'target', 'javascripts'),
        filename: `${env === 'dev' ? '' : '[chunkhash]/[name].js'}`,
        chunkFilename: `${env === 'dev' ? '' : `[chunkhash]/${outputName}.chunk-[id].js`}`,
    },
    resolve: {
        modules: [
            path.join(__dirname, 'static', 'src'),
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
            bean: 'components/bean/bean',
            bonzo: 'components/bonzo/bonzo',
            domReady: 'components/domready/ready',
            EventEmitter: 'components/eventEmitter/EventEmitter',
            fastdom: 'components/fastdom/index',
            fence: 'components/fence/fence',
            lodash: 'components/lodash-amd',
            picturefill: 'projects/common/utils/picturefill',
            Promise: 'components/when/Promise',
            qwery: 'components/qwery/qwery',
            raven: 'components/raven-js/raven',
            classnames: 'components/classnames/index',
            reqwest: 'components/reqwest/reqwest',
            stripe: 'stripe/stripe.min',
            svgs: 'inline-svgs',
            'ophan/ng': 'ophan/ophan.ng',
            videojs: 'components/video.js/video',
            'videojs-embed': 'components/videojs-embed/videojs.embed',
            'videojs-ima': 'components/videojs-ima/videojs.ima',
            'videojs-ads-lib': 'components/videojs-contrib-ads/videojs.ads',
            'videojs-persistvolume': 'components/videojs-persistvolume/videojs.persistvolume',
            'videojs-playlist': 'components/videojs-playlist-audio/videojs.playlist',

            // #wp-rjs once r.js is gone, these can be unaliased and modules updated
            react: 'react/addons',

            // plugins
            text: 'components/requirejs-text/text',
            inlineSvg: 'projects/common/utils/inlineSvg',
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
