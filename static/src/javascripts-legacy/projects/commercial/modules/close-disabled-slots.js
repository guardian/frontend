define([
    'qwery',
    'lib/fastdom-promise',
    'commercial/modules/commercial-features'
], function (
    qwery,
    fastdom,
    commercialFeatures
) {
    var adSlotSelector = '.js-ad-slot';
    var mpuCandidateSelector = '.fc-slice__item--mpu-candidate';

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

    function initForAdFree() {
        var mpuCandidates = qwery(mpuCandidateSelector).filter(shouldDisableAdSlotWhenAdFree);
        return fastdom.write(function () {
            mpuCandidates.forEach(function (candidate) {
                candidate.classList.add('fc-slice__item--no-mpu');
            });
        });
    }

    function shouldDisableAdSlot(adSlot) {
        return window.getComputedStyle(adSlot).display === 'none' || shouldDisableAdSlotWhenAdFree(adSlot);
    }

    function shouldDisableAdSlotWhenAdFree(adSlot) {
        return commercialFeatures.adFree &&
            !adSlot.className.toLowerCase().contains('merchandising');
    }

    return {
        init: init,
        initForAdFree: initForAdFree
    };
});
