define([
    'commercial/modules/messenger/dfp-origin'
], function (dfpOrigin) {
    return postMessage;

    function postMessage(message, targetWindow) {
        targetWindow.postMessage(JSON.stringify(message), dfpOrigin);
    }
});
