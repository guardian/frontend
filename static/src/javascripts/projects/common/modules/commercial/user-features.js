define([
    'common/utils/_',
    'common/utils/ajax-promise',
    'common/utils/cookies',
    'common/utils/config',
    'common/utils/storage',
    'common/modules/identity/api'
], function (
    _,
    ajaxPromise,
    cookies,
    config,
    storage,
    identity
) {
    var PERSISTENCE_KEYS = {
        ADFREE_COOKIE : 'gu_adfree_user',
        USER_FEATURES_EXPIRY_COOKIE : 'gu_user_features_expiry',
        PAYING_MEMBER_COOKIE : 'gu_paying_member'
    };

    function isAdfree() {
        // Defer to the value set by the preflight scripts
        // They need to determine how the page will appear before it starts rendering

        // This field might not be added if the feature switch is off
        if (config.commercial === undefined || config.commercial.showingAdfree === undefined) {
            return false;
        } else {
            return config.commercial.showingAdfree;
        }
    }

    function refresh() {
        if (featureEnabled() && identity.isUserLoggedIn() && needNewFeatureData()) {
            updateUserFeatures();
        }
        if (!featureEnabled() || haveDataAfterSignout()) {
            cleanupOldData();
        }
    }

    function isPayingMember() {
        // If the user is logged in, but has no cookie yet, play it safe and assume they're a paying user
        return identity.isUserLoggedIn() && cookies.get(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE) !== 'false';
    }

    function featureEnabled() {
        return config.switches.advertOptOut || config.switches.adblock;
    }

    function needNewFeatureData() {
        return !hasAllFeaturesData() || featuresDataIsOld();
    }

    function haveDataAfterSignout() {
        return (!identity.isUserLoggedIn() && hasAnyFeaturesData());
    }

    function hasAllFeaturesData() {
        return cookies.get(PERSISTENCE_KEYS.ADFREE_COOKIE) &&
            cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE) &&
            cookies.get(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
    }

    function hasAnyFeaturesData() {
        return cookies.get(PERSISTENCE_KEYS.ADFREE_COOKIE) ||
            cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE) ||
            cookies.get(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
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
        cookies.remove(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
    }

    function updateUserFeatures() {
        ajaxPromise({
            url : config.page.userAttributesApiUrl + '/me/features',
            crossOrigin : true,
            error : function () {}
        }).then(persistResponse, _.noop);
    }

    function persistResponse(JsonResponse) {
        var expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1);
        cookies.add(PERSISTENCE_KEYS.ADFREE_COOKIE, JsonResponse.adFree);
        cookies.add(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE, expiryDate.getTime().toString());
        cookies.add(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, !JsonResponse.adblockMessage);
    }

    return {
        refresh : refresh,
        isAdfree : isAdfree,
        isPayingMember : isPayingMember
    };
});
