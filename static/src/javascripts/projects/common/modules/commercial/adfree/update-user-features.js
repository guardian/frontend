define([
    'common/utils/ajax-promise',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/storage'
], function (
    ajaxPromise,
    config,
    cookies
) {
    var PERSISTENCE_KEYS = {
        ADFREE_COOKIE : 'gu_adfree_user',
        USER_FEATURES_EXPIRY_COOKIE : 'gu_user_features_expiry'
    };

    function updateUserFeatures() {
        ajaxPromise({
            url : config.page.userAttributesApiUrl + '/me/features',
            crossOrigin : true
        }).then(persistResponse);
    }

    function persistResponse(JsonResponse) {
        var expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1);
        cookies.add(PERSISTENCE_KEYS.ADFREE_COOKIE, JsonResponse.adFree);
        cookies.add(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE, expiryDate.getTime().toString());
    }

    return {
        update : updateUserFeatures
    };
});
