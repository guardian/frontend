define([
    'common',
    'domwrite',
    'qwery',
    'bonzo',

    'modules/userPrefs',
    'modules/detect',
    'modules/adverts/document-write',
    'modules/adverts/documentwriteslot',
    'modules/adverts/dimensionMap',
    'modules/adverts/audience-science',
    'modules/adverts/quantcast'
],
function (
    common,
    domwrite,
    qwery,
    bonzo,

    userPrefs,
    detect,
    documentWrite,
    DocumentWriteSlot,
    dimensionMap,
    audienceScience,
    quantcast
) {
    
    var config,
        adsSwitchedOn,
        slots;

    function init(c) {
        config = c;
        slots = [];

        generateMiddleSlot(config);

        var slotHolders = document.querySelectorAll('.ad-slot'),
            size = (window.innerWidth > 810) ? 'median' : 'base';

        adsSwitchedOn = !userPrefs.isOff('adverts');

        // Run through slots and create documentWrite for each.
        // Other ad types such as iframes and custom can be plugged in here later
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

            if (config.switches.quantcast) {
                quantcast.load();
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

        //This is a horrible hack to hide slot if no creative is returned from oas
        //Check existence of empty tracking pixel
        if(config.page.pageId === "") {
            var middleSlot = document.getElementById('ad-slot-middle-banner-ad');

            if(middleSlot.innerHTML.indexOf("x55/default/empty.gif")  !== -1) {
                bonzo(middleSlot).hide();
            }
        }
    }

    function isOnScreen(el) {
        return (
            el.offsetTop < (window.innerHeight + window.pageYOffset) &&
            (el.offsetTop + el.offsetHeight) > window.pageYOffset
        );
    }

    function generateMiddleSlot(config) {
        //Temporary middle slot needs better implementation in the future
        if(config.page.pageId === "") {
            var slot =  '<div id="ad-slot-middle-banner-ad" data-link-name="ad slot middle-banner-ad"';
                slot += ' data-base="x55" data-median="x55" class="ad-slot"><div class="ad-container"></div></div>';

            bonzo(qwery('.front-trailblock-commentisfree li')[1]).after(slot);
        }
    }

    return {
        init: init,
        loadAds: loadAds,
        isOnScreen: isOnScreen
    };

});
