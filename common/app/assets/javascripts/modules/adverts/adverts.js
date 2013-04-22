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
    
    var currConfig,
        currContext,
        adsSwitchedOn,
        slots;

    function init(config, context) {
        currConfig  = config;
        currContext = context;
        slots = [];

        var size = (window.innerWidth > 810) ? 'median' : 'base';

        adsSwitchedOn = !userPrefs.isOff('adverts');

        // Run through slots and create documentWrite for each.
        // Other ad types such as iframes and custom can be plugged in here later
        if (adsSwitchedOn) {
            
            Array.prototype.forEach.call(currContext.querySelectorAll('.ad-slot'), function(as) {
                var name = as.getAttribute('data-' + size),
                    container = as.querySelector('.ad-container'),
                    slot = new DocumentWriteSlot(name, container);
                
                container.innerHTML = '';

                slot.setDimensions(dimensionMap[name]);
                slots.push(slot);
            });
            
            if (currConfig.switches.audienceScience) {
                audienceScience.load(currConfig.page);
            }

            if (currConfig.switches.quantcast) {
                quantcast.load();
            }
        
            generateMiddleSlot(currConfig);
        }

        //Make the request to ad server
        documentWrite.load({
            config: currConfig,
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
        if(currConfig.page.pageId === "") {
            var middleSlot = currContext.querySelector('.ad-slot-middle-banner-ad');

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

    function generateMiddleSlot() {
        //Temporary middle slot needs better implementation in the future
        if(currConfig.page.pageId === "") {
            var slot =  '<div class="ad-slot-middle-banner-ad ad-slot" data-link-name="ad slot middle-banner-ad"';
                slot += ' data-base="x55" data-median="x55"><div class="ad-container"></div></div>';

            bonzo(currContext.querySelector('.front-trailblock-commentisfree li')).after(slot);
        }
    }

    return {
        init: init,
        loadAds: loadAds,
        isOnScreen: isOnScreen
    };

});
