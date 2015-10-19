define([
    'common/utils/cookies',
    'common/utils/config',
    'common/utils/storage',
    'common/modules/commercial/adfree/request-user-features',
    'common/modules/identity/api'
], function (
    cookies,
    config,
    storage,
    requestUserFeatures,
    identity
) {
    var KEYS = {
        ADFREE_COOKIE : 'gu_adfree_user',
        USER_FEATURES_EXPIRY_COOKIE : 'gu_user_features_expiry'
    };

    function refresh() {
        if (featureEnabled() && identity.isUserLoggedIn() && needNewFeatureData()) {
            getNewData();
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
        return cookies.get(KEYS.ADFREE_COOKIE) && cookies.get(KEYS.USER_FEATURES_EXPIRY_COOKIE);
    }

    function featuresDataIsOld() {
        var featuresExpiryCookie = cookies.get(KEYS.USER_FEATURES_EXPIRY_COOKIE),
            featuresExpiryTime = new Date(featuresExpiryCookie).getTime(),
            timeNow = new Date().getTime();
        return timeNow >= featuresExpiryTime;
    }

    function getNewData() {
        requestUserFeatures.request().then(function persistFeatures(userFeatures) {
            var expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 1);
            cookies.add(KEYS.ADFREE_COOKIE, userFeatures.adFree);
            cookies.add(KEYS.USER_FEATURES_EXPIRY_COOKIE, expiryDate.getTime().toString());
        });
    }

    function cleanupOldData() {
        // We expect adfree cookies to be cleaned up by the logout process, but what if the user's login simply times out?
        cookies.remove(KEYS.ADFREE_COOKIE);
        cookies.remove(KEYS.USER_FEATURES_EXPIRY_COOKIE);
    }

    return {
        refresh : refresh,
        isAdfree : function getAdfree() {
            // Defer to the value set by the preflight scripts
            // They need to determine how the page will appear before it starts rendering
            if (config.commercial) {
                return config.commercial.showingAdfree;
            } else {
                return false;
            }
        }
    };
});
