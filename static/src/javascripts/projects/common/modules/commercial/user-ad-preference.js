define([
    'common/utils/config',
    'common/utils/cookies'
], function (
    config,
    cookies
) {
    var featureEnabled = config.switches.advertOptOut;

    function userOptsOut() {
        var preferenceCookie = cookies.get('gu_adfree_user');
        return preferenceCookie === 'true';
    }

    return {
        hideAds : featureEnabled && userOptsOut()
    };
});
