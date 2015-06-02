define([
    'common/utils/config',
    'common/utils/cookies'
], function (config,
             cookies) {

    function lightBeacon() {
        if (config.switches.gravity) {
            return require(['js!' + '//rma-api.gravity.com/v1/beacons/log?' +
            'site_guid=14b492cf6727dd1ab3a6efc7556b91bc&' +
            'action=beacon&' +
            'user_guid=' + cookies.get('grvinsights') + '&' +
            'referrer=' + document.referrer + '&' +
            'browser_useragent=' + navigator.userAgent + '&' +
            'href=' + location.href + '&' +
            'url=' + [location.protocol, '//', location.host, location.pathname].join('') + '&' +
            'article_title=' + document.title + '&' +
            'type=content']);
        }
    }

    return {
        lightBeacon: lightBeacon
    };
});
