define([
    'qwery',
    'lib/fastdom-promise'
], function (
    qwery,
    fastdom
) {
    var adSlotSelector = '.js-ad-slot';

    function init(force) {
        // Get all ad slots
        var adSlots = qwery(adSlotSelector);

        if (!force) {
            // remove the ones which should not be there
            adSlots = adSlots.filter(shouldDisableAdSlot);
        }

        return fastdom.write(function () {
            adSlots.forEach(function (adSlot) {
                if (adSlot.parentNode) {
                    adSlot.parentNode.removeChild(adSlot);
                }
            });
        });
    }

    function shouldDisableAdSlot(adSlot) {
        return window.getComputedStyle(adSlot).display === 'none';
    }

    return {
        init: init
    };
});
