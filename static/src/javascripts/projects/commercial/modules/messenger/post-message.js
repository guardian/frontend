define([
    'commercial/modules/dfp/dfp-origin'
], function (dfpOrigin) {
    return postMessage;

    function postMessage(message, targetWindow) {
        targetWindow.postMessage(JSON.stringify(message), dfpOrigin);
    }
});
