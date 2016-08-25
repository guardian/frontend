define([
    'common/modules/commercial/dfp/private/get-advert-by-id',
    'common/modules/commercial/dfp/private/post-message'
], function (getAdvertById, postMessage) {
    return onLoad;

    function onLoad(event) {
        var advert = getAdvertById(event.slot.getSlotElementId());
        var iframe = advert.node.querySelector('iframe');
        postMessage({ id: iframe.id }, iframe.contentWindow);
    }
});
