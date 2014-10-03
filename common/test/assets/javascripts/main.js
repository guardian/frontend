var tests = [];
for (var file in window.__karma__.files) {
    if (/.*\.spec\.js$/.test(file)) {
        tests.push(file);
    }
}

// figure the app from the tests location
var app = /^\/base\/([^/]*)/.exec(tests[0])[1];

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/' + app + '/app/assets/javascripts',
    paths: {
        common:       '/base/common/app/assets/javascripts',
        bean:         '/base/common/app/assets/javascripts/components/bean/bean',
        bonzo:        '/base/common/app/assets/javascripts/components/bonzo/bonzo',
        enhancer:     '/base/common/app/assets/javascripts/components/enhancer/enhancer',
        EventEmitter: '/base/common/app/assets/javascripts/components/eventEmitter/EventEmitter',
        imager:       '/base/common/app/assets/javascripts/components/imager.js/container',
        lodash:       '/base/common/app/assets/javascripts/components/lodash-amd',
        qwery:        '/base/common/app/assets/javascripts/components/qwery/qwery',
        raven:        '/base/common/app/assets/javascripts/components/raven-js/raven',
        reqwest:      '/base/common/app/assets/javascripts/components/reqwest/reqwest',
        analytics:    '/base/common/app/assets/javascripts/modules/analytics',
        stripe:       '/base/common/app/public/javascripts/vendor/stripe/stripe.min',
        Squire:       '/base/common/test/assets/javascripts/components/squire/src/Squire',
        fixtures:     '/base/common/test/assets/javascripts/fixtures',
        helpers:      '/base/common/test/assets/javascripts/helpers'
    },
    map: {
        '*': {
            // mock out omniture script
            // TODO - better way of mocking dependencies?
            omniture: '/base/common/test/assets/javascripts/spies/omniture.js'
        }
    },
    shim: {
        imager: {
            deps: ['/base/common/app/assets/javascripts/components/imager.js/imager.js'],
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
