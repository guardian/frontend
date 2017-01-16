/* eslint-disable no-unused-expressions */
({
    baseUrl: '../../../../static/transpiled/javascripts',
    paths: {
        admin: 'projects/admin',
        common: 'projects/common',
        facia: 'projects/facia',
        membership: 'projects/membership',
        commercial: 'projects/commercial',
        bean: '../../vendor/javascripts/components/bean/bean',
        bonzo: '../../vendor/javascripts/components/bonzo/bonzo',
        domReady: '../../vendor/javascripts/components/domready/ready',
        EventEmitter: '../../vendor/javascripts/components/eventEmitter/EventEmitter',
        fastdom: '../../vendor/javascripts/components/fastdom/index',
        fence: '../../vendor/javascripts/components/fence/fence',
        lodash: '../../vendor/javascripts/components/lodash-amd',
        picturefill: 'projects/common/utils/picturefill',
        Promise: '../../vendor/javascripts/components/when/Promise',
        qwery: '../../vendor/javascripts/components/qwery/qwery',
        raven: '../../vendor/javascripts/components/raven-js/raven',
        classnames: '../../vendor/javascripts/components/classnames/index',
        reqwest: '../../vendor/javascripts/components/reqwest/reqwest',
        svgs: '../../../common/conf/assets/inline-svgs',

        // video
        videojs: '../../vendor/javascripts/components/video.js/video',
        'videojs-embed': '../../vendor/javascripts/components/videojs-embed/videojs.embed',
        'videojs-ima': '../../vendor/javascripts/components/videojs-ima/videojs.ima',
        'videojs-ads-lib': '../../vendor/javascripts/components/videojs-contrib-ads/videojs.ads',
        'videojs-persistvolume': '../../vendor/javascripts/components/videojs-persistvolume/videojs.persistvolume',
        'videojs-playlist': '../../vendor/javascripts/components/videojs-playlist-audio/videojs.playlist',

        // plugins
        text: '../../vendor/javascripts/components/requirejs-text/text',
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
