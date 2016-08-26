define([
    'common/modules/commercial/dfp/private/get-advert-by-id',
    'common/modules/commercial/dfp/private/post-message'
], function (getAdvertById, postMessage) {
    var nativeAdName = /^\d+-\d+-\d+;\d+;<!DOCTYPE/;
    return onLoad;

    function onLoad(event) {
        var advert = getAdvertById(event.slot.getSlotElementId());
        var iframe = advert.node.querySelector('iframe');
        /* We don't have (yet) a means to identify a native creative, so we
           resort to that heuristic for now, which tests whether the iframe[name]
           starts with a special string such as 1-0-4;33540;<!DOCTYPE */
        if (nativeAdName.test(iframe.name)) {
            postMessage({ id: iframe.id }, iframe.contentWindow);
        }
    }
});
