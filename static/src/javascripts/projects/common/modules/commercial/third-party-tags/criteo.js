define([
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/url'
], function (
    config,
    cookies,
    urlUtils
) {

    var netId = '1476',
        cookieName = 'cto2_guardian',
        criteoUrl = 'http://rtax.criteo.com/delivery/rta/rta.js',
        varName = 'crtg_content';

    function getSegments() {
        var cookieValue = decodeURIComponent(cookies.get(cookieName));
        return (config.switches.criteo && cookieValue) ? urlUtils.getUrlVars({query: cookieValue}) : {};
    }

    function load() {
        if (config.switches.criteo) {
            var query = urlUtils.constructQuery({
                netid: netId,
                cookieName: cookieName,
                rnd: Math.floor(Math.random() * 99999999999),
                varName: varName
            });
            return require([criteoUrl + '?' + query + '!system-script']);
        }
    }

    return {
        load: load,
        getSegments: getSegments
    };

});
