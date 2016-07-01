define([
    'common/utils/detect',
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/hide-advert',
    'common/modules/commercial/dfp/private/define-slot',
    'common/modules/commercial/dfp/private/breakpoint-name-to-attribute',
    'common/modules/commercial/commercial-features'
], function (detect, dfpEnv, hideAdvert, defineSlot, breakpointNameToAttribute, commercialFeatures) {
    return queueAdvert;

    function queueAdvert(advert, index) {
        // filter out (and remove) hidden ads
        if (shouldFilterAdSlot(advert.node)) {
            hideAdvert(advert);
        } else {
            advert.sizes = getAdBreakpointSizes(advert);
            advert.slot = defineSlot(advert.node, advert.sizes);
            dfpEnv.advertsToLoad.push(advert);
            // Add to the array of ads to be refreshed (when the breakpoint changes)
            // only if its `data-refresh` attribute isn't set to false.
            if (advert.node.getAttribute('data-refresh') !== 'false') {
                dfpEnv.advertsToRefresh.push(advert);
            }
        }
        dfpEnv.advertIds[advert.id] = index === undefined ? dfpEnv.adverts.length - 1 : index;
    }

    function shouldFilterAdSlot(adSlotNode) {
        return isVisuallyHidden(adSlotNode) || isDisabledCommercialFeature(adSlotNode);
    }

    function isVisuallyHidden(adSlotNode) {
        return getComputedStyle(adSlotNode).display === 'none';
    }

    function isDisabledCommercialFeature(adSlotNode) {
        return !commercialFeatures.topBannerAd && adSlotNode.getAttribute('data-name') === 'top-above-nav';
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
