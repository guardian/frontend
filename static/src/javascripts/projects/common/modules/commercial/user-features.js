define([
    'common/utils/cookies',
    'common/utils/config',
    'common/utils/fetch',
    'common/utils/storage',
    'common/modules/identity/api'
], function (
    cookies,
    config,
    fetch,
    storage,
    identity
) {
    var PERSISTENCE_KEYS = {
        USER_FEATURES_EXPIRY_COOKIE : 'gu_user_features_expiry',
        PAYING_MEMBER_COOKIE : 'gu_paying_member',
        AD_FREE_USER_COOKIE : 'GU_AFU'
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
                    || !cookies.get(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE)
                    || !cookies.get(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE);
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
                    || cookies.get(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE)
                    || cookies.get(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE);
            }
        }
    };

    function requestNewData() {
        // Cannot use `fetchJson` here as we consider 404 to be a valid response
        var userAttributeUrl = config.page.userAttributesApiUrl + '/me/features';
        fetch(userAttributeUrl, {
            mode: 'cors',
            credentials: 'include'
        })
        .then(function(resp) {
            if (resp.ok || resp.status == 404) {
                persistResponse(resp.json());
            } else {
                if (!resp.status) {
                    // IE9 uses XDomainRequest which doesn't set the response status thus failing
                    // even when the response was actually valid
                    resp.text().then(function (responseText) {
                        try {
                            persistResponse(JSON.parse(responseText));
                        } catch (ex) {
                            throw new Error('Fetch error while requesting ' + userAttributeUrl + ': Invalid JSON response');
                        }
                    });
                } else {
                    throw new Error('Fetch error while requesting ' + userAttributeUrl + ': ' + resp.statusText);
                }
            }
        })
        .catch(function () {});
    }

    function persistResponse(JsonResponse) {
        var expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1);
        cookies.add(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE, expiryDate.getTime().toString());
        cookies.add(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, !JsonResponse.adblockMessage);
        cookies.add(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE, JsonResponse.adFree);
    }

    function deleteOldData() {
        // We expect adfree cookies to be cleaned up by the logout process, but what if the user's login simply times out?
        cookies.remove(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
        cookies.remove(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
        cookies.remove(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE);
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

    UserFeatures.prototype.isAdFreeUser = function () {
        if (cookies.get(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE) === null) {
            this.refresh();
        }
        return cookies.get(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE) === 'true';
    };

    return new UserFeatures();
});
