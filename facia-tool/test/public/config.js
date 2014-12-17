curl.config({
    baseUrl: "base/public/js/",
    paths: {
        knockout:      'components/knockout/dist/knockout',
        EventEmitter:  'components/eventEmitter/EventEmitter.min',
        views:         '../../app/views',
        css:           '../css',
        test:          '../../test/public'
    },
    pluginPath: 'components/curl/src/curl/plugin'
});

$.mockjaxSettings.logging = false;
$.mockjaxSettings.responseTime = 50;
