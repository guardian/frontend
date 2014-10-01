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
        common:       '/base/static/src/javascripts',
        bean:         '/base/static/src/javascripts/components/bean/bean',
        bonzo:        '/base/static/src/javascripts/components/bonzo/bonzo',
        enhancer:     '/base/static/src/javascripts/components/enhancer/enhancer',
        EventEmitter: '/base/static/src/javascripts/components/eventEmitter/EventEmitter',
        imager:       '/base/static/src/javascripts/components/imager.js/container',
        lodash:       '/base/static/src/javascripts/components/lodash-amd',
        qwery:        '/base/static/src/javascripts/components/qwery/qwery',
        raven:        '/base/static/src/javascripts/components/raven-js/raven',
        reqwest:      '/base/static/src/javascripts/components/reqwest/reqwest',
        analytics:    '/base/static/src/javascripts/modules/analytics',
        stripe:       '/base/static/src/javascripts/vendor/stripe/stripe.min',
        Squire:       '/base/static/test/javascripts/components/squire/src/Squire',
        fixtures:     '/base/static/test/javascripts/fixtures',
        helpers:      '/base/static/test/javascripts/helpers'
    },
    map: {
        '*': {
            // mock out omniture script
            // TODO - better way of mocking dependencies?
            omniture: '/base/static/test/javascripts/spies/omniture.js'
        }
    },
    shim: {
        imager: {
            deps: ['/base/static/src/javascripts/components/imager.js/imager.js'],
            exports: 'Imager'
        },
        googletag: {
            exports: 'googletag'
        }
    }
});

require(tests, function() {
    window.__karma__.start();
});
