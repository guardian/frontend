define([
    'commercial/modules/messenger/dfp-origin'
], function (dfpOrigin) {
    return postMessage;

    function postMessage(message, targetWindow, targetOrigin) {
        targetWindow.postMessage(JSON.stringify(message), targetOrigin || dfpOrigin);
    }
});
