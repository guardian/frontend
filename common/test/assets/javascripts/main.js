var tests = [],
    specUrl = '/base/common/test/assets/javascripts',
    specRegExp = new RegExp(specUrl.replace(/\//g, '\\/') + '\/.*\\.spec\\.js');

for (var file in window.__karma__.files) {
    if (file.match(specRegExp)) {
        tests.push(file);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/common/app/assets/javascripts',
    paths: {
        common:       '/base/common/app/assets/javascripts',
        fixtures:     '/base/common/test/assets/javascripts/fixtures',
        helpers:      '/base/common/test/assets/javascripts/helpers',
        analytics:    '/base/common/app/assets/javascripts/modules/analytics',
        bean:         '/base/common/app/assets/javascripts/components/bean/bean',
        bonzo:        '/base/common/app/assets/javascripts/components/bonzo/src/bonzo',
        domReady:     '/base/common/app/assets/javascripts/components/domready/ready',
        EventEmitter: '/base/common/app/assets/javascripts/components/eventEmitter/EventEmitter',
        qwery:        '/base/common/app/assets/javascripts/components/qwery/mobile/qwery-mobile',
        reqwest:      '/base/common/app/assets/javascripts/components/reqwest/src/reqwest',
        postscribe:   '/base/common/app/assets/javascripts/components/postscribe/dist/postscribe',
        lodash:       '/base/common/app/assets/javascripts/components/lodash-amd/modern',
        imager:       '/base/common/app/assets/javascripts/components/imager.js/src/strategies/container'
    },
    map: {
        '*': {
            // mock out omniture script
            // TODO - better way of mocking dependencies?
            omniture: '/base/common/test/assets/javascripts/spies/omniture'
        }
    },
    shim: {
        imager: {
            deps: ['/base/common/app/assets/javascripts/components/imager.js/src/imager'],
            exports: 'Imager'
        }
    }
});

require(tests, function() {
    window.__karma__.start();
});
