define(['lib/fastdom-promise', 'commercial/modules/messenger'], function(
    fastdom,
    messenger
) {
    messenger.register('type', function(specs, ret, iframe) {
        return setType(specs, iframe.closest('.js-ad-slot'));
    });

    return setType;

    function setType(type, adSlot) {
        return fastdom.write(function() {
            adSlot.classList.add('ad-slot--' + type);
        });
    }
});
