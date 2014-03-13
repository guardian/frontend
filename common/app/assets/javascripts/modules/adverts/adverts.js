define([
    'common/$',
    'qwery',
    'bonzo',
    'common/utils/ajax',
    'common/modules/userPrefs',
    'common/utils/detect',
    'common/modules/adverts/document-write',
    'common/modules/adverts/documentwriteslot',
    'common/modules/adverts/dimensionMap',
    'common/modules/adverts/userAdTargeting'
],
function (
    $,
    qwery,
    bonzo,
    ajax,
    userPrefs,
    detect,
    documentWrite,
    DocumentWriteSlot,
    dimensionMap,
    userAdTargeting
) {

    var slots,
        currConfig;

    function init(config) {
        slots = [];
        currConfig = config;

        var size = (window.innerWidth > 810) ? 'median' : 'base';

        // Run through slots and create documentWrite for each.
        // Other ad types such as iframes and custom can be plugged in here later

        var els = document.querySelectorAll('.ad-slot');

        for(var i = 0, l = els.length; i < l; i++) {
            var el = els[i];

            if($(el).css('display') !== 'none') {
                var container = el.querySelector('.ad-container'),
                    name,
                    slot;

                // Empty all ads in the DOM
                container.innerHTML = '';

                name = el.getAttribute('data-' + size);
                slot = new DocumentWriteSlot(name, container);
                slot.setDimensions(dimensionMap[name]);
                slots.push(slot);
            }
        }

        //Make the request to ad server
        documentWrite.load({
            config: currConfig,
            slots: slots,
            userSegments : userAdTargeting.getUserSegments()
        });
    }

    function load() {
        //Run through adslots and check if they are on screen. Load if so.
        for (var i = 0, j = slots.length; i<j; ++i) {
            //Add && isOnScreen(slots[i].el) to conditional below to trigger lazy loading
            if (!slots[i].loaded && slots[i].el.innerHTML === '') {
                slots[i].render();
            }
        }
    }

    function destroy() {
        if (slots.length) {
            for (var i = 0, j = slots.length; i<j; ++i) {
                slots[i].el.innerHTML = '';
                slots[i].loaded = false;
            }
        }
    }

    function reload() {
        destroy();
        init(currConfig);
    }

    function isOnScreen(el) {
        return (
            el.offsetTop < (window.innerHeight + window.pageYOffset) &&
            (el.offsetTop + el.offsetHeight) > window.pageYOffset
        );
    }

    function hideAds() {
        $('.ad-slot').addClass('is-hidden');
        $('.top-banner-ad-container').addClass('is-invisible');
    }

    return {
        hideAds: hideAds,
        init: init,
        load: load,
        reload: reload,
        isOnScreen: isOnScreen
    };

});