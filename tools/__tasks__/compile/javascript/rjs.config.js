/* eslint-disable no-unused-expressions */
({
    baseUrl: '../../../../static/src/javascripts',
    paths: {
        admin: 'projects/admin',
        common: 'projects/common',
        facia: 'projects/facia',
        membership: 'projects/membership',
        commercial: 'projects/commercial',
        bean: '../../../static/vendor/javascripts/components/bean/bean',
        bonzo: '../../../static/vendor/javascripts/components/bonzo/bonzo',
        domReady: '../../../static/vendor/javascripts/components/domready/ready',
        EventEmitter: '../../../static/vendor/javascripts/components/eventEmitter/EventEmitter',
        fastdom: '../../../static/vendor/javascripts/components/fastdom/index',
        fence: '../../../static/vendor/javascripts/components/fence/fence',
        lodash: '../../../static/vendor/javascripts/components/lodash-amd',
        picturefill: 'projects/common/utils/picturefill',
        Promise: '../../../static/vendor/javascripts/components/when/Promise',
        qwery: '../../../static/vendor/javascripts/components/qwery/qwery',
        raven: '../../../static/vendor/javascripts/components/raven-js/raven',
        classnames: '../../../static/vendor/javascripts/components/classnames/index',
        reqwest: '../../../static/vendor/javascripts/components/reqwest/reqwest',
        svgs: '../../../common/conf/assets/inline-svgs',

        // video
        videojs: '../../../static/vendor/javascripts/components/video.js/video',
        'videojs-embed': '../../../static/vendor/javascripts/components/videojs-embed/videojs.embed',
        'videojs-ima': '../../../static/vendor/javascripts/components/videojs-ima/videojs.ima',
        'videojs-ads-lib': '../../../static/vendor/javascripts/components/videojs-contrib-ads/videojs.ads',
        'videojs-persistvolume': '../../../static/vendor/javascripts/components/videojs-persistvolume/videojs.persistvolume',
        'videojs-playlist': '../../../static/vendor/javascripts/components/videojs-playlist-audio/videojs.playlist',

        // plugins
        text: '../../../static/vendor/javascripts/components/requirejs-text/text',
        inlineSvg: 'projects/common/utils/inlineSvg',

        react: 'empty:',
        'ophan/ng': 'empty:',
    },
    shim: {
        'videojs-ima': {
            deps: ['videojs-ads-lib'],
        },
        'videojs-ads-lib': {
            deps: ['bootstraps/enhanced/media/videojs-global'],
        },
        omniture: {
            exports: 's',
        },
    },
    optimize: 'uglify2',
    generateSourceMaps: true,
    preserveLicenseComments: false,
    fileExclusionRegExp: /^bower_components/i,
});
