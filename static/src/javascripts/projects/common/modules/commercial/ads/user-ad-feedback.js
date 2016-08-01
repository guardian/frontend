define([
    'common/modules/commercial/dfp/private/ophan-tracking'
], function (
    ophanTracking
) {

    function userAdFeedback(adSlot, reason) {
        console.log('feedback received for slot: ' + adSlot + ' reason: ' + reason);
        // TODO: Activate this ophan call when this handler is correctly attached to the controls
        //       In the meantime, shut up, eslint!
        var ophan = false;
        if (ophan) {
            ophanTracking.updateAdvertMetric(adSlot, 'user-feedback', reason);
        }
    }

    return userAdFeedback;

});
