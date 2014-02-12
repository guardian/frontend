var tests = [],
    // app we're testing
    app = window.__karma__.config.args._[0].split(':').pop(),
    specUrl = '/base/' + app + '/test/assets/javascripts/spec',
    specRegExp = new RegExp(specUrl.replace(/\//g, '\\/') + '\/.*\\.spec\\.js');

console.log(window.__karma__.exclude);
for (var file in window.__karma__.files) {
    if (file.match(specRegExp)) {
        tests.push(file);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/' + app + '/app/assets/javascripts',
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
            omniture: '/base/common/test/assets/javascripts/spies/omniture.js'
        }
    },
    shim: {
        imager: {
            deps: ['/base/common/app/assets/javascripts/components/imager.js/src/imager.js'],
            exports: 'Imager'
        }
    }
});

require(tests, function() {
    window.__karma__.start();
});
