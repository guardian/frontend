/*global guardian:true */
define([
    'common',
    'reqwest',
    'modules/detect',
    'modules/adverts/iframeadslot',
    'modules/adverts/dimensionMap',
    'modules/adverts/audience-science'
],
function (common, reqwest, detect, IframeAdSlot, dimensionMap, audienceScience) {

    var config,
        adsSwitchedOn,
        audienceScienceSegments,
        slots;

    function init(c) {
        config = c;
        slots = [];

        var slotHolders = document.querySelectorAll('.ad-slot'),
            size = (window.innerWidth > 728) ? 'median' : 'base';

        adsSwitchedOn = !guardian.userPrefs.isOff('adverts');

        // Run through slots and create IframeAdSlots for each.
        // Other ad types to be plugged in later.
        if (adsSwitchedOn) {
            for(var i = 0, j = slotHolders.length; i < j; ++i) {
                var name = slotHolders[i].getAttribute('data-' + size);
                var slot = new IframeAdSlot(name, slotHolders[i], config.page);
                slot.setDimensions(dimensionMap[name]);
                slots.push(slot);
            }
            if (config.switches.audienceScience) {
                audienceScience.load(config.page);
            }
        }
    }

    function loadAds() {
        if (adsSwitchedOn) {
            //Run through adslots and check if they are on screen. Load if so.
            for (var i = 0, j = slots.length; i<j; ++i) {
                if (!slots[i].loaded && isOnScreen(slots[i].el)) {
                    slots[i].load();
                }
            }
        }
    }

    function isOnScreen(el) {
        return (
            el.offsetTop < (window.innerHeight + window.pageYOffset) &&
            (el.offsetTop + el.offsetHeight) > window.pageYOffset
        );
    }

    return {
        init: init,
        loadAds: loadAds,
        isOnScreen: isOnScreen
    };
});