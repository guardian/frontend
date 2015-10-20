define([
    'common/utils/cookies',
    'common/utils/config',
    'common/utils/storage',
    'common/modules/commercial/adfree/update-user-features',
    'common/modules/identity/api'
], function (
    cookies,
    config,
    storage,
    updateUserFeatures,
    identity
) {
    var PERSISTENCE_KEYS = {
        ADFREE_COOKIE : 'gu_adfree_user',
        USER_FEATURES_EXPIRY_COOKIE : 'gu_user_features_expiry'
    };

    function refresh() {
        if (featureEnabled() && identity.isUserLoggedIn() && needNewFeatureData()) {
            updateUserFeatures.update();
        }
        if (!featureEnabled() || haveDataAfterSignout()) {
            cleanupOldData();
        }
    }

    function featureEnabled() {
        return config.switches.advertOptOut;
    }

    function needNewFeatureData() {
        return !hasFeaturesData() || featuresDataIsOld();
    }

    function haveDataAfterSignout() {
        return (!identity.isUserLoggedIn() && hasFeaturesData());
    }

    function hasFeaturesData() {
        return cookies.get(PERSISTENCE_KEYS.ADFREE_COOKIE) && cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
    }

    function featuresDataIsOld() {
        var featuresExpiryCookie = cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE),
            featuresExpiryTime = parseInt(featuresExpiryCookie, 10),
            timeNow = new Date().getTime();
        return timeNow >= featuresExpiryTime;
    }

    function cleanupOldData() {
        // We expect adfree cookies to be cleaned up by the logout process, but what if the user's login simply times out?
        cookies.remove(PERSISTENCE_KEYS.ADFREE_COOKIE);
        cookies.remove(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
    }

    function isAdfree() {
        // Defer to the value set by the preflight scripts
        // They need to determine how the page will appear before it starts rendering
        return config.commercial ? config.commercial.showingAdfree : false;
    }

    return {
        refresh : refresh,
        isAdfree : isAdfree
    };
});
