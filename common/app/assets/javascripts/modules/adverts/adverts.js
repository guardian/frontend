define([
    'common',
    'reqwest',
    'domwrite',
    'modules/userPrefs',
    'modules/detect',
    'modules/adverts/document-write',
    'modules/adverts/documentwriteslot',
    'modules/adverts/dimensionMap',
    'modules/adverts/audience-science'
],
function (
    common,
    reqwest,
    domwrite,

    userPrefs,
    detect,
    documentWrite,
    DocumentWriteSlot,
    dimensionMap,
    audienceScience
) {
    
    var config,
        adsSwitchedOn,
        audienceScienceSegments,
        slots;

    function init(c) {
        config = c;
        slots = [];

        var slotHolders = document.querySelectorAll('.ad-slot'),
            size = (window.innerWidth > 810) ? 'median' : 'base';

        adsSwitchedOn = !userPrefs.isOff('adverts');

        // Run through slots and create documentWrite for each.
        // Other ad types suchas iframes and custom can be plugged in here later
        if (adsSwitchedOn) {
            for(var i = 0, j = slotHolders.length; i < j; ++i) {
                var name = slotHolders[i].getAttribute('data-' + size);
                var slot = new DocumentWriteSlot(name, slotHolders[i].querySelector('.ad-container'));
                slot.setDimensions(dimensionMap[name]);
                slots.push(slot);
            }
            if (config.switches.audienceScience) {
                audienceScience.load(config.page);
            }
        }

        //Make the request to ad server
        documentWrite.load({
            config: config,
            slots: slots
        });
    }

    function loadAds() {
        domwrite.capture();
        if (adsSwitchedOn) {
            //Run through adslots and check if they are on screen. Load if so.
            for (var i = 0, j = slots.length; i<j; ++i) {
                //Add && isOnScreen(slots[i].el) to conditional below to trigger lazy loading
                if (!slots[i].loaded) {
                    slots[i].render();
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
