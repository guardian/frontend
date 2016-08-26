define([
    'common/modules/commercial/dfp/private/dfp-origin'
], function (dfpOrigin) {
    return postMessage;

    function postMessage(message, targetWindow) {
        targetWindow.postMessage(JSON.stringify(message), dfpOrigin);
    }
});
