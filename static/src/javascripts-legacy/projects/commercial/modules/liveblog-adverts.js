define([
    'lib/fastdom-promise',
    'lib/detect',
    'lib/config',
    'lib/mediator',
    'commercial/modules/dfp/add-slot',
    'commercial/modules/commercial-features',
    'commercial/modules/dfp/create-slot',
    'common/modules/article/space-filler'
], function (
    fastdom,
    detect,
    config,
    mediator,
    addSlot,
    commercialFeatures,
    createSlot,
    spaceFiller
) {
    var INTERVAL = 5;      // number of posts between ads
    var OFFSET = 1.5;      // ratio of the screen height from which ads are loaded
    var MAX_ADS = 8;       // maximum number of ads to display

    var slotCounter = 0, isMobile, windowHeight, firstSlot;

    function startListening() {
        mediator.on('modules:autoupdate:updates', onUpdate);
    }

    function stopListening() {
        mediator.off('modules:autoupdate:updates', onUpdate);
    }

    function getSpaceFillerRules(windowHeight, update) {
        var prevSlot, prevIndex;
        update = !!update;
        return {
            bodySelector: '.js-liveblog-body',
            slotSelector: ' > .block',
            fromBottom: update,
            startAt: update ? firstSlot : null,
            absoluteMinAbove: update ? 0 : (windowHeight * OFFSET),
            minAbove: 0,
            minBelow: 0,
            filter: filterSlot
        };

        function filterSlot(slot, index) {
            if (index === 0) {
                prevSlot = slot;
                prevIndex = index;
                return !update;
            } else if (index - prevIndex >= INTERVAL && Math.abs(slot.top - prevSlot.top) >= windowHeight) {
                prevSlot = slot;
                prevIndex = index;
                return true;
            }

            return false;
        }
    }

    function insertAds(slots) {
        for (var i = 0; i < slots.length && slotCounter < MAX_ADS; i++) {
            var slotName = isMobile && slotCounter === 0 ?
                'top-above-nav' : isMobile ?
                'inline' + slotCounter :
                'inline' + (slotCounter + 1);
            var adSlot = createSlot('inline', { name: slotName, classes: 'liveblog-inline' });
            slots[i].parentNode.insertBefore(adSlot, slots[i].nextSibling);
            addSlot.addSlot(adSlot);
            slotCounter += 1;
        }
    }

    function fill(rules) {
        return spaceFiller.fillSpace(rules, insertAds)
            .then(function (result) {
                if (result && slotCounter < MAX_ADS) {
                    firstSlot = document.querySelector(rules.bodySelector + ' > .ad-slot').previousSibling;
                    startListening();
                } else {
                    firstSlot = null;
                }
            });
    }

    function onUpdate() {
        stopListening();
        Promise.resolve(getSpaceFillerRules(windowHeight, true)).then(fill);
    }

    function init(start, stop) {
        start();

        if (!commercialFeatures.commercialFeatures.liveblogAdverts) {
            stop();
            return Promise.resolve();
        }

        isMobile = detect.getBreakpoint() === 'mobile';

        fastdom.read(function () {
            return windowHeight = document.documentElement.clientHeight;
        })
        .then(getSpaceFillerRules)
        .then(fill)
        .then(stop);

        return Promise.resolve();
    }

    return {
        init: init
    };
});
