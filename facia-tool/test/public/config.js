curl.config({
    baseUrl: "base/public/js/",
    paths: {
        knockout:      'components/knockout.js/knockout.js',
        EventEmitter:  'components/eventEmitter/EventEmitter',
        reqwest:       'components/reqwest/reqwest',
        bean:          'components/bean/bean',
        bonzo:         'components/bonzo/bonzo',
        omniture:      'omniture.js',
        views:         '../../app/views',
        css:           '../css',
        fixtures:      '../../test/public/fixtures'
    },
    pluginPath: 'components/curl/src/curl/plugin'
});

$.mockjaxSettings.logging = false;
