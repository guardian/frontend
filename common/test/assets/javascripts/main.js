var tests = [],
    specUrl = '/base/common/test/assets/javascripts/spec',
    specRegExp = new RegExp(specUrl.replace(/\//g, '\\/') + '\/.*\\.spec\\.js'),
    spec;

for (var file in window.__karma__.files) {
    // We are only testing against discussion for now
    if (file.match(specRegExp)) {
        spec = file
                .replace(specUrl, 'spec')
                .replace('.js', '');
        tests.push(spec);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/common/app/assets/javascripts',
    paths: {
        'spec': specUrl,
        'fixtures': '/base/common/test/assets/javascripts/fixtures',
        'helpers': '/base/common/test/assets/javascripts/helpers',
        'analytics': 'modules/analytics',

        'bean': 'components/bean/bean',
        'bonzo': 'components/bonzo/src/bonzo',
        'domReady': 'components/domready/ready',
        'EventEmitter': 'components/eventEmitter/EventEmitter',
        'qwery': 'components/qwery/mobile/qwery-mobile',
        'reqwest': 'components/reqwest/src/reqwest',
        'postscribe': 'components/postscribe/dist/postscribe',
        'swipe': 'components/swipe/swipe',
        'swipeview': 'components/swipeview/src/swipeview',
        'lodash': 'components/lodash-amd/modern',
        'imager': 'components/imager.js/src/strategies/container'
    },
    shim: {
        imager: {
            deps: ['components/imager.js/src/imager'],
            exports: 'Imager'
        }
    }
});

require(tests, function() {
    window.__karma__.start();
});