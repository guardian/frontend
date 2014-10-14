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
        bootsraps:    'bootstraps',
        admin:        'projects/admin',
        common:       'projects/common',
        facia:        'projects/facia',
        membership:   'projects/membership',
        bean:         'components/bean/bean',
        bonzo:        'components/bonzo/bonzo',
        EventEmitter: 'components/eventEmitter/EventEmitter',
        qwery:        'components/qwery/qwery',
        reqwest:      'components/reqwest/reqwest',
        lodash:       'components/lodash-amd',
        imager:       'components/imager.js/container',
        fence:        'components/fence/fence',
        enhancer:     'components/enhancer/enhancer',
        raven:        'components/raven-js/raven',
        fastclick:    'components/fastclick/fastclick',
        omniture:     '/base/static/public/javascripts/vendor/omniture',
        stripe:       '/base/static/public/javascripts/vendor/stripe/stripe.min',
        jasq:         '/base/static/test/javascripts/components/jasq/jasq',
        fixtures:     '/base/static/test/javascripts/fixtures',
        helpers:      '/base/static/test/javascripts/helpers'
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
