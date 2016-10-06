define([
    'commercial/modules/dfp/get-advert-by-id',
    'commercial/modules/messenger/post-message'
], function (getAdvertById, postMessage) {
    var nativeAdName = /^\d+-\d+-\d+;\d+;<!DOCTYPE/;
    var host = location.protocol + '//' + location.host;
    return onLoad;

    /* This is for native ads. We send two pieces of information:
       - the ID of the iframe into which this ad is embedded. This is currently
         the only way to link an incoming message to the iframe it is "coming from"
       - the HOST of the parent frame. Again, inside the embedded document there is
         no way to know if we are running the site in production, dev or local mode.
         But, this information is necessary in the window.postMessage call, and so
         we resort to sending it as a token of welcome :)
    */
    function onLoad(event) {
        var advert = getAdvertById(event.slot.getSlotElementId());
        var iframe = advert.node.querySelector('iframe');
        /* We don't have (yet) a means to identify a native creative, so we
           resort to that heuristic for now, which tests whether the iframe[name]
           starts with a special string such as 1-0-4;33540;<!DOCTYPE

           Note: this test detects SafeFrames, not native ads in particular */
        if (nativeAdName.test(iframe.name)) {
            postMessage({ id: iframe.id, host: host }, iframe.contentWindow);
        }
    }
});
