define([
    'common/utils/config',
    'common/utils/cookies'
], function (
    config,
    cookies
) {
    var featureEnabled = config.switches.advertOptOut;

    function userOptsOut() {
        var preferenceCookie = cookies.get('ad_free_experience');
        return preferenceCookie === 'true';
    }

    return {
        hideAds : featureEnabled && userOptsOut()
    };
});
