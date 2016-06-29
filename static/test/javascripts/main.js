/*global requirejs*/
var tests = [];
for (var file in window.__karma__.files) {
    if (/.*\.spec\.js$/.test(file)) {
        tests.push(file);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/static/src/javascripts',
    paths: {
        admin:        'projects/admin',
        common:       'projects/common',
        facia:        'projects/facia',
        membership:   'projects/membership',
        bean:         '/base/node_modules/bean/bean',
        bonzo:        '/base/node_modules/bonzo/bonzo',
        react:        '/base/node_modules/react/dist/react-with-addons',
        EventEmitter: '/base/node_modules/wolfy87-eventemitter/EventEmitter',
        fastdom:      '/base/node_modules/fastdom/index',
        fence:        '/base/node_modules/fence/fence',
        lodash:       '/base/node_modules/lodash-amd/compat',
        picturefill:  'projects/common/utils/picturefill',
        Promise:      '/base/node_modules/when/es6-shim/Promise',
        qwery:        '/base/node_modules/qwery/qwery',
        raven:        '/base/node_modules/raven-js/dist/raven',
        reqwest:      '/base/node_modules/reqwest/reqwest',
        analytics:    'projects/common/modules/analytics/analytics',
        // Test specific paths
        omniture:     'vendor/omniture',
        stripe:       'vendor/stripe/stripe.min',
        squire:       '/base/static/test/javascripts/components/squire/src/Squire',
        fixtures:     '/base/static/test/javascripts/fixtures',
        helpers:      '/base/static/test/javascripts/helpers',
        svgs:         '../inline-svgs',
        // plugins
        text:         '/base/node_modules/requirejs-text/text',
        inlineSvg:    'projects/common/utils/inlineSvg'
    },
    shim: {
        googletag: {
            exports: 'googletag'
        }
    }
});

require(['Promise', 'common/utils/to-array'], function (Promise, toArray) {
    require(tests, function () {
        Promise.all(toArray(arguments)).then(function () {
            window.__karma__.start();
        });
    });
});
