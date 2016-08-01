define([
    'common/modules/commercial/dfp/private/ophan-tracking'
], function (
    ophanTracking
) {

    function userAdFeedback(advert, reason) {
        alert('feedback accepted' + advert.id + ' ' + reason);
        // TODO: Activate this ophan call when this handler is correctly attached to the controls
        //       In the meantime, shut up, eslint!
        var ophan = false;
        if (ophan) {
            ophanTracking.updateAdvertMetric(advert, 'user-feedback', reason);
        }
    }

    return userAdFeedback;

});
