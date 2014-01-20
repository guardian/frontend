var tests = [],
    specUrl = '/base/common-test/spec',
    specRegExp = new RegExp(specUrl.replace(/\//g, '\\/') + '\/.*\\.spec\\.js'),
    spec;

for (var file in window.__karma__.files) {
    if (file.match(specRegExp)) {
        tests.push(file);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base',
    paths: {
        spec:         specUrl,
        fixtures:     'common-test/fixtures',
        helpers:      'common-test/helpers',
        analytics:    'common/modules/analytics',
        bean:         'common/components/bean/bean',
        bonzo:        'common/components/bonzo/src/bonzo',
        domReady:     'common/components/domready/ready',
        EventEmitter: 'common/components/eventEmitter/EventEmitter',
        qwery:        'common/components/qwery/mobile/qwery-mobile',
        reqwest:      'common/components/reqwest/src/reqwest',
        postscribe:   'common/components/postscribe/dist/postscribe',
        swipe:        'common/components/swipe/swipe',
        lodash:       'common/components/lodash-amd/modern',
        imager:       'common/components/imager.js/src/strategies/container'
    },
    map: {
        '*': {
            // mock out omniture script
            // TODO - better way of mocking dependencies?
            omniture: 'common-test/spies/omniture'
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
