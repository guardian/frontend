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
        bean:         'components/bean/bean',
        bonzo:        'components/bonzo/bonzo',
        react:        '/base/static/public/javascripts/components/react/react',
        EventEmitter: 'components/eventEmitter/EventEmitter',
        fastclick:    'components/fastclick/fastclick',
        fastdom:      'components/fastdom/index',
        fence:        'components/fence/fence',
        lodash:       'components/lodash-amd',
        picturefill:  'projects/common/utils/picturefill',
        Promise:      'components/when/Promise',
        qwery:        'components/qwery/qwery',
        raven:        'components/raven-js/raven',
        reqwest:      'components/reqwest/reqwest',
        analytics:    'projects/common/modules/analytics/analytics',
        'comment-count': '/base/node_modules/guardian-comment-count/dist/comment-count.amd',
        // Test specific paths
        omniture:     'vendor/omniture',
        stripe:       'vendor/stripe/stripe.min',
        squire:       '/base/static/test/javascripts/components/squire/src/Squire',
        fixtures:     '/base/static/test/javascripts/fixtures',
        helpers:      '/base/static/test/javascripts/helpers',
        svgs:         '../inline-svgs',
        // plugins
        text:         'components/requirejs-text/text',
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
