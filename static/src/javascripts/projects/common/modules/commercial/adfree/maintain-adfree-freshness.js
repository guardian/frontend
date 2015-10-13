define([
    'common/utils/cookies',
    'common/utils/config',
    'common/utils/storage',
    'common/modules/identity/api',
    'common/modules/commercial/adfree/renew-adfree-status'
], function (
    cookies,
    config,
    storage,
    identity,
    renewAdfreeStatus
) {
    return maintainAdfreeFreshness;

    function maintainAdfreeFreshness() {
        if (featureEnabled() && identity.isUserLoggedIn() && userNeedsNewAdfreeCookie()) {
            renewAdfreeStatus.renew();
        }
    }

    function userNeedsNewAdfreeCookie() {
        var adfreeCookie = cookies.get('gu_adfree_user');
        return (adfreeCookie === null) || adfreeCookieStale();
    }

    function adfreeCookieStale() {
        var adfreeCookieExpiry = storage.local.get('gu_adfree_user_expiry'),
            currentTime = new Date().getTime();
        return (adfreeCookieExpiry === null) || (currentTime > adfreeCookieExpiry);
    }

    function featureEnabled() {
        return config.switches.advertOptOut;
    }
});
