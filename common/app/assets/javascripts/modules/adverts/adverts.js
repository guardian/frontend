define(['common', 'reqwest', 'modules/detect', 'modules/adverts/iframeadslot', 'modules/adverts/dimensionMap'], function (common, reqwest, detect, IframeAdSlot, dimensionMap) {

    var config,
        slots = [];

    function init(c) {
        config = c;

        var slotHolders = document.querySelectorAll('.ad-slot'),
            size = (window.innerWidth > 728) ? 'median' : 'base';

        // Run through slots and create IframeAdSlots for each.
        // Other ad types to be plugged in later.
        for(var i = 0, j = slotHolders.length; i < j; i++) {
            var name = slotHolders[i].getAttribute('data-' + size);
            var slot = new IframeAdSlot(name, slotHolders[i], config);
            slot.setDimensions(dimensionMap[name]);
            slots.push(slot);
        }
    }


    function loadAds() {
        //Run through adslots and check if they are on screen. Load if so.
        for (var i = 0, j = slots.length; i<j; ++i) {
            if (!slots[i].loaded && isOnScreen(slots[i].el)) {
                slots[i].load();
            }
        }
    }

    function isOnScreen(el) {
        return (el.offsetTop < (window.innerHeight + window.pageYOffset));
    }

    return {
        init: init,
        loadAds: loadAds,
        isOnScreen: isOnScreen
    }
});