var tests = [],
    specUrl = '/base/tests/specs',
    specRegExp = new RegExp(specUrl.replace(/\//g, '\\/') + '\/.*\\.spec\\.js'),
    spec;

for (var file in window.__karma__.files) {
    if (file.match(specRegExp)) {
        tests.push(file);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/javascripts',
    paths: {
        spec:         specUrl,
        fixtures:     '../tests/fixtures',
        helpers:      '../tests/helpers',
        analytics:    'common/modules/analytics',
        bean:         'common/components/bean/bean',
        bonzo:        'common/components/bonzo/src/bonzo',
        domReady:     'common/components/domready/ready',
        EventEmitter: 'common/components/eventEmitter/EventEmitter',
        qwery:        'common/components/qwery/mobile/qwery-mobile',
        reqwest:      'common/components/reqwest/src/reqwest',
        postscribe:   'common/components/postscribe/dist/postscribe',
        lodash:       'common/components/lodash-amd/modern',
        imager:       'common/components/imager.js/src/strategies/container'
    },
    map: {
        '*': {
            // mock out omniture script
            // TODO - better way of mocking dependencies?
            omniture: '../tests/spies/omniture'
        }
    },
    shim: {
        imager: {
            deps: ['common/components/imager.js/src/imager'],
            exports: 'Imager'
        }
    }
});

require(tests, function() {
    window.__karma__.start();
});
