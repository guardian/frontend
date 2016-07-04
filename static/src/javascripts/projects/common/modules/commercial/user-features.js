define([
    'common/utils/ajax-promise',
    'common/utils/cookies',
    'common/utils/config',
    'common/utils/storage',
    'common/modules/identity/api',
    'lodash/utilities/noop'
], function (
    ajaxPromise,
    cookies,
    config,
    storage,
    identity,
    noop
) {
    var PERSISTENCE_KEYS = {
        USER_FEATURES_EXPIRY_COOKIE : 'gu_user_features_expiry',
        PAYING_MEMBER_COOKIE : 'gu_paying_member'
    };

    function UserFeatures() {
        // Exposed for testing
        this._requestNewData = requestNewData;
        this._deleteOldData = deleteOldData;
        this._persistResponse = persistResponse;
    }
    
    /**
     * Updates the user's data in a lazy fashion
     */
    UserFeatures.prototype.refresh = function () {
        if (identity.isUserLoggedIn() && userNeedsNewFeatureData()) {
            this._requestNewData();
        } else if (userHasDataAfterSignout()) {
            this._deleteOldData();
        }

        function userNeedsNewFeatureData() {
            return featuresDataIsMissing() || featuresDataIsOld();

            function featuresDataIsMissing() {
                return !cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE)
                    || !cookies.get(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
            }

            function featuresDataIsOld() {
                var featuresExpiryCookie = cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
                var featuresExpiryTime = parseInt(featuresExpiryCookie, 10);
                var timeNow = new Date().getTime();
                return timeNow >= featuresExpiryTime;
            }
        }

        function userHasDataAfterSignout() {
            return !identity.isUserLoggedIn() && userHasData();

            function userHasData() {
                return cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE)
                    || cookies.get(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
            }
        }
    };

    function requestNewData() {
        ajaxPromise({
            url : config.page.userAttributesApiUrl + '/me/features',
            crossOrigin : true,
            withCredentials : true,
            error : function () {}
        }).then(persistResponse, noop);
    }

    function persistResponse(JsonResponse) {
        var expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1);
        cookies.add(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE, expiryDate.getTime().toString());
        cookies.add(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, !JsonResponse.adblockMessage);
    }

    function deleteOldData() {
        // We expect adfree cookies to be cleaned up by the logout process, but what if the user's login simply times out?
        cookies.remove(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
        cookies.remove(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
    }

    /**
     * Does our _existing_ data say the user is a paying member?
     * This data may be stale; we do not wait for userFeatures.refresh()
     * @returns {boolean}
     */
    UserFeatures.prototype.isPayingMember = function () {
        // If the user is logged in, but has no cookie yet, play it safe and assume they're a paying user
        return identity.isUserLoggedIn()
            && (cookies.get(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE) !== 'false');
    };

    return new UserFeatures();
});
