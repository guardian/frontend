/*jshint loopfunc: true */
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
    'modules/adverts/quantcast',
    'modules/adverts/sticky-mpu',
    'modules/adverts/inview'
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
    quantcast,
    StickyMpu
) {
    
    var currConfig,
        currContext,
        slots,
        contexts = {};

    function init(config, context) {
        var id = context.id;
        var size = (window.innerWidth > 810) ? 'median' : 'base';

        if(id) {

            contexts[id] = context;
            currConfig  = config;
            currContext = context;
            slots = [];

            // Run through slots and create documentWrite for each.
            // Other ad types such as iframes and custom can be plugged in here later
            
            for (var c in contexts) {
                var els = contexts[c].querySelectorAll('.ad-slot');
                for(var i = 0, l = els.length; i < l; i += 1) {
                    var container = els[i].querySelector('.ad-container'),
                        name,
                        slot;
                    // Empty all ads in the dom
                    container.innerHTML = '';
                    // Load the currContext ads only
                    if (contexts[c] === currContext ) {
                        name = els[i].getAttribute('data-' + size);
                        slot = new DocumentWriteSlot(name, container, contexts[c]);
                        slot.setDimensions(dimensionMap[name]);
                        slots.push(slot);
                    }
                }
            }
        }
        
        if (currConfig.switches.audienceScience) {
            audienceScience.load(currConfig.page);
        }

        if (currConfig.switches.quantcast) {
            quantcast.load();
        }

        //Make the request to ad server
        documentWrite.load({
            config: currConfig,
            slots: slots
        });

        //inView(currConfig, currContext, size);
    }

    function loadAds() {

        domwrite.capture();

        //Run through adslots and check if they are on screen. Load if so.
        for (var i = 0, j = slots.length; i<j; ++i) {
            //Add && isOnScreen(slots[i].el) to conditional below to trigger lazy loading
            if (!slots[i].loaded && slots[i].el.innerHTML === '') {
                slots[i].render(function(context){
                    if(slots[i].name === "x07") {
                        var s = new StickyMpu({
                            context: context
                        });
                    }
                });
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
