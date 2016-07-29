define([
    'common/modules/commercial/dfp/private/ophan-tracking'
], function (
    ophanTracking
) {

    function userAdFeedback(advert, reason) {
        alert('feedback accepted' + advert.id + ' ' + reason);
    }

    return userAdFeedback;

});
