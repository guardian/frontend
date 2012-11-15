define([
    'common',
    'reqwest',
    'modules/userPrefs',
    'modules/detect',
    'modules/adverts/document-write',
    'modules/adverts/audience-science'
],
function (common, reqwest, detect, documentWrite, audienceScience) {
    
    var config,
        adsSwitchedOn,
        audienceScienceSegments,
        slots;

    function init(c) {
        config = c;
        slots = [];

        var slotHolders = document.querySelectorAll('.ad-slot'),
            size = (window.innerWidth > 810) ? 'median' : 'base';

        adsSwitchedOn = !guardian.userPrefs.isOff('adverts');

        // Run through slots and create IframeAdSlots for each.
        // Other ad types to be plugged in later.
        if (adsSwitchedOn) {
            var d = new documentWrite(config).load();
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

})
