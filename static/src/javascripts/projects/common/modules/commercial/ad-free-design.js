define([
    'Promise',
    'common/utils/$',
    'common/modules/commercial/user-ad-preference'
], function (
    Promise,
    $,
    userAdPreference
) {
    function init() {
        if (userAdPreference.hideAds) {
            $(document.body).addClass('ad-free'); // Use .ad-free__hidden to flag elements for suppression
        }
        return Promise.resolve(null);
    }

    return {
        init : init
    };
});
