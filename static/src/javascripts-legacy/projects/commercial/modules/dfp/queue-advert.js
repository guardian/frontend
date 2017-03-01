define([
    'common/utils/detect',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/define-slot',
    'commercial/modules/dfp/breakpoint-name-to-attribute'
], function (detect, dfpEnv, defineSlot, breakpointNameToAttribute) {
    return queueAdvert;

    function queueAdvert(advert, index) {
        advert.sizes = getAdBreakpointSizes(advert);
        var slotDefinition = defineSlot(advert.node, advert.sizes);
        advert.slot = slotDefinition.slot;
        advert.whenSlotReady = slotDefinition.slotReady;
        dfpEnv.advertsToLoad.push(advert);
        // Add to the array of ads to be refreshed (when the breakpoint changes)
        // only if its `data-refresh` attribute isn't set to false.
        if (advert.node.getAttribute('data-refresh') !== 'false') {
            dfpEnv.advertsToRefresh.push(advert);
        }
        dfpEnv.advertIds[advert.id] = index === undefined ? dfpEnv.adverts.length - 1 : index;
    }

    function getAdBreakpointSizes(advert) {
        return detect.breakpoints.reduce(function (sizes, breakpoint) {
            var data = advert.node.getAttribute('data-' + breakpointNameToAttribute(breakpoint.name));
            if (data) {
                sizes[breakpoint.name] = createSizeMapping(data);
            }
            return sizes;
        }, {});
    }

    /** A breakpoint can have various sizes assigned to it. You can assign either on
     * set of sizes or multiple.
     *
     * One size       - `data-mobile="300,50"`
     * Multiple sizes - `data-mobile="300,50|320,50"`
     */
    function createSizeMapping(attr) {
        return attr.split('|').map(function (size) {
            return size === 'fluid' ? 'fluid' : size.split(',').map(Number);
        });
    }
});
