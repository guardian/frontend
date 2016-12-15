/* eslint-disable import/no-extraneous-dependencies */

const webpack = require('webpack');
const path = require('path');

// we shoudln't use this 'transpiled' directory once we kill require,
// it's just so we can build with transpiled code in r.js.
// eventually we'd obviously use the babel-loader here,
// just keeps it the same code for now.
const { target, transpiled } = require('./tools/__tasks__/config').paths;

module.exports = {
    entry: path.join(transpiled, 'javascripts', 'boot-webpack.js'),
    resolve: {
        modulesDirectories: [path.join(transpiled, 'javascripts')],
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
            stripe: 'vendor/stripe/stripe.min',
            svgs: 'inline-svgs',
            'ophan/ng': 'vendor/ophan/ophan.ng',
            videojs: 'components/video.js/video',
            'videojs-embed': 'components/videojs-embed/videojs.embed',
            'videojs-ima': 'components/videojs-ima/videojs.ima',
            'videojs-ads-lib': 'components/videojs-contrib-ads/videojs.ads',
            'videojs-persistvolume': 'components/videojs-persistvolume/videojs.persistvolume',
            'videojs-playlist': 'components/videojs-playlist-audio/videojs.playlist',

            // plugins
            text: 'components/requirejs-text/text',
            inlineSvg: 'projects/common/utils/inlineSvg',
        },
    },
    externals: {
        xhr2: {},
    },
    output: {
        path: path.join(target, 'javascripts'),
        filename: 'boot-webpack.js',
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.DedupePlugin(),
    ],
};
