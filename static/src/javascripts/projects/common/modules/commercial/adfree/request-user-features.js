define([
    'common/utils/ajax-promise',
    'common/utils/config',
    'common/utils/storage'
], function (
    ajaxPromise,
    config
) {
    return {
        request : requestUserFeatures
    };

    function requestUserFeatures() {
        return ajaxPromise({
            url : config.page.userAttributesApiUrl + '/me/features',
            crossOrigin : true
        });
    }
});
