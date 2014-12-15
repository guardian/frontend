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
        enhancer:     'components/enhancer/enhancer',
        EventEmitter: 'components/eventEmitter/EventEmitter',
        fastclick:    'components/fastclick/fastclick',
        fence:        'components/fence/fence',
        imager:       'components/imager.js/container',
        lodash:       'components/lodash-amd',
        Promise:      'components/native-promise-only/npo.src',
        qwery:        'components/qwery/qwery',
        raven:        'components/raven-js/raven',
        reqwest:      'components/reqwest/reqwest',
        omniture:     '/base/static/public/javascripts/vendor/omniture',
        stripe:       '/base/static/public/javascripts/vendor/stripe/stripe.min',
        jasq:         '/base/static/test/javascripts/components/jasq/jasq',
        squire:       '/base/static/test/javascripts/components/squire/src/Squire',
        fixtures:     '/base/static/test/javascripts/fixtures',
        helpers:      '/base/static/test/javascripts/helpers',
        // plugins
        text:         'components/requirejs-text/text'
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
    // fix
    window.setTimeout(window.__karma__.start, 2000);
});
