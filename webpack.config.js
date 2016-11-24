const webpack  = require('webpack');

module.exports = {
    entry: './static/src/javascripts/boot-webpack.js',
    resolve: {
        modulesDirectories: ['static/src/javascripts'],
        alias: {
            admin:                      'projects/admin',
            common:                     'projects/common',
            facia:                      'projects/facia',
            membership:                 'projects/membership',
            commercial:                 'projects/commercial',
            bean:                       'components/bean/bean',
            bonzo:                      'components/bonzo/bonzo',
            domReady:                   'components/domready/ready',
            EventEmitter:               'components/eventEmitter/EventEmitter',
            fastdom:                    'components/fastdom/index',
            fence:                      'components/fence/fence',
            lodash:                     'components/lodash-amd',
            picturefill:                'projects/common/utils/picturefill',
            Promise:                    'components/when/Promise',
            qwery:                      'components/qwery/qwery',
            raven:                      'components/raven-js/raven',
            classnames:                 'components/classnames/index',
            reqwest:                    'components/reqwest/reqwest',
            stripe:                     'vendor/stripe/stripe.min',
            svgs:                       'inline-svgs',
            'ophan/ng':                 'vendor/ophan/ophan.ng',
            videojs:                    'components/video.js/video',
            'videojs-embed':            'components/videojs-embed/videojs.embed',
            'videojs-ima':              'components/videojs-ima/videojs.ima',
            'videojs-ads-lib':          'components/videojs-contrib-ads/videojs.ads',
            'videojs-persistvolume':    'components/videojs-persistvolume/videojs.persistvolume',
            'videojs-playlist':         'components/videojs-playlist-audio/videojs.playlist',

            // plugins
            text:                       'components/requirejs-text/text',
            inlineSvg:                  'projects/common/utils/inlineSvg'
        }
    },
    externals: {
        xhr2: {}
    },
    output: {
        path: __dirname + '/static/target/javascripts',
        filename: 'boot-webpack.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.DedupePlugin()
    ]
};
