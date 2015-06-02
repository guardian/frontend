define([
    'common/utils/config',
    'common/utils/cookies'
], function (config,
             cookies) {

    function userGuid() {
        var cookieVal = cookies.get('grvinsights');
        return cookieVal === null ? '' : cookieVal;
    }

    function lightBeacon() {
        if (config.switches.gravity) {
            return require(['js!' + 'https://secure-api.gravity.com/v1/beacons/log?' +
            'site_guid=14b492cf6727dd1ab3a6efc7556b91bc&' +
            'action=beacon&' +
            'user_guid=' + userGuid() + '&' +
            'referrer=' + document.referrer + '&' +
            'browser_useragent=' + navigator.userAgent + '&' +
            'href=' + location.href + '&' +
            'url=' + [location.protocol, '//', location.host, location.pathname].join('') + '&' +
            'article_title=' + document.title + '&' +
            'type=content&' +
            'section_id=' + config.page.section]);
        }
    }

    function getRecommendations() {
        if (config.switches.gravity && config.page.contentType === 'Article') {
            return require(['js!' + 'https://secure-api.gravity.com/v1/api/intelligence/wl?' +
            'jq=&' +
            'sg=14b492cf6727dd1ab3a6efc7556b91bc&' +
            'ug=' + userGuid() + '&' +
            'id=gravity&' +
            'pl=127&' +
            'type=iframe']);
        }
    }

    return {
        lightBeacon: lightBeacon,
        getRecommendations: getRecommendations
    };
});
