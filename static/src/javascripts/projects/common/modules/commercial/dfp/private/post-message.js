define(function () {
    return postMessage;

    function postMessage(message, targetWindow) {
        targetWindow.postMessage(JSON.stringify(message), location.protocol + '//tpc.googlesyndication.com');
    }
});
