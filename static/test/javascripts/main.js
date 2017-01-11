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
        bean:         '/base/static/vendor/javascripts/components/bean/bean',
        bonzo:        '/base/static/vendor/javascripts/components/bonzo/bonzo',
        react:        '/base/static/vendor/javascripts/react/react',
        EventEmitter: '/base/static/vendor/javascripts/components/eventEmitter/EventEmitter',
        fastclick:    '/base/static/vendor/javascripts/components/fastclick/fastclick',
        fastdom:      '/base/static/vendor/javascripts/components/fastdom/index',
        fence:        '/base/static/vendor/javascripts/components/fence/fence',
        lodash:       '/base/static/vendor/javascripts/components/lodash-amd',
        picturefill:  'projects/common/utils/picturefill',
        Promise:      '/base/static/vendor/javascripts/components/when/Promise',
        qwery:        '/base/static/vendor/javascripts/components/qwery/qwery',
        reqwest:      '/base/static/vendor/javascripts/components/reqwest/reqwest',
        analytics:    'projects/common/modules/analytics/analytics',
        // Test specific paths
        omniture:     '/base/static/vendor/javascripts/omniture/omniture',
        squire:       '/base/static/test/javascripts/components/squire/src/Squire',
        fixtures:     '/base/static/test/javascripts/fixtures',
        helpers:      '/base/static/test/javascripts/helpers',
        svgs:         '/base/static/src/inline-svgs',
        // plugins
        text:         '/base/static/vendor/javascripts/components/requirejs-text/text',
        svg:          'projects/common/utils/inlineSvg',
        // raven
        raven:        '/base/static/vendor/javascripts/components/raven-js/raven',
        'common/utils/raven':        '/base/static/test/javascripts/fixtures/raven'
    }
});

require(['Promise', 'common/utils/to-array'], function (Promise, toArray) {
    require(tests, function () {
        Promise.all(toArray(arguments)).then(function () {
            window.__karma__.start();
        });
    });
});
