var tests = [],
    specUrl = '/base/common/test/assets/javascripts/',
    spec;

for (var file in window.__karma__.files) {
    if (/discussion\/.*spec\.js$/.test(file)) {
        spec = file.replace(specUrl, '').replace('.js', '');
        console.log(spec)
        tests.push(spec);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/common/app/assets/javascripts',
    deps: tests,
    paths: {
        'spec': '/base/common/test/assets/javascripts/spec',
        'fixtures': '/base/common/test/assets/javascripts/fixtures',
        'helpers': '/base/common/test/assets/javascripts/helpers',
        'analytics':    'modules/analytics',

        'bean': 'components/bean/bean',
        'bonzo': 'components/bonzo/src/bonzo',
        'domReady': 'components/domready/ready',
        'EventEmitter': 'components/eventEmitter/EventEmitter',
        'qwery': 'components/qwery/mobile/qwery-mobile',
        'reqwest': 'components/reqwest/src/reqwest',
        'postscribe': 'components/postscribe/dist/postscribe',
        'swipe': 'components/swipe/swipe',
        'swipeview': 'components/swipeview/src/swipeview',
        'lodash': 'components/lodash-amd/modern'
    },
    callback: window.__karma__.start
});