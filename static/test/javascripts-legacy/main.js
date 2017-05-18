/*global requirejs*/
var tests = [];
for (var file in window.__karma__.files) {
    if (/.*\.spec\.js$/.test(file)) {
        tests.push(file);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/static/transpiled/javascripts',
    paths: {
        admin:        'projects/admin',
        common:       'projects/common',
        facia:        'projects/facia',
        membership:   'projects/membership',
        commercial:   'projects/commercial',

        bean:         '/base/node_modules/bean/bean',
        bonzo:        '/base/node_modules/bonzo/bonzo',
        'react/addons': '/base/node_modules/react/dist/react-with-addons',
        EventEmitter: '/base/node_modules/wolfy87-eventemitter/EventEmitter',
        fastclick:    '/base/node_modules/fastclick/fastclick',
        fastdom:      '/base/node_modules/fastdom/index',
        fence:        '/base/node_modules/fence/fence',
        lodash:       '/base/node_modules/lodash-amd/compat',
        qwery:        '/base/node_modules/qwery/qwery',
        reqwest:      '/base/node_modules/reqwest/reqwest',
        videojs:      '/base/node_modules/video.js',
        'videojs-ads-lib': '/base/node_modules/videojs-contrib-ads',
        raven:        '/base/node_modules/raven-js/dist/raven',
        'ophan/ng':   '/base/node_modules/ophan-tracker-js/build/ophan.ng',

        analytics:    'projects/common/modules/analytics/analytics',
        picturefill:  'lib/picturefill',
        // Test specific paths
        omniture:     '/base/static/vendor/javascripts/omniture/omniture',
        squire:       '/base/static/test/javascripts-legacy/components/squire/src/Squire',
        fixtures:     '/base/static/test/javascripts-legacy/fixtures',
        helpers:      '/base/static/test/javascripts-legacy/helpers',
        svgs:         '/base/static/src/inline-svgs',
        // plugins
        'raw-loader':    '/base/static/test/javascripts-legacy/helpers/raw-loader',
        'lib/raven': '/base/static/test/javascripts-legacy/fixtures/raven'
    }
});

require(['lodash/collections/toArray'], function (toArray) {
    require(tests, function () {
        Promise.all(toArray(arguments)).then(window.__karma__.start);
    });
});
