define([
    'common/utils/url',
    'common/utils/config',
    'common/utils/detect',
    'lodash/arrays/uniq',
    'lodash/arrays/flatten'
], function (urlUtils, config, detect, uniq, flatten) {
    return defineSlot;

    function defineSlot(adSlotNode, sizes) {
        var slotTarget = adSlotNode.getAttribute('data-name');
        var adUnitOverride = urlUtils.getUrlVars()['ad-unit'];
        // if ?ad-unit=x, use that
        var adUnit = adUnitOverride ?
            '/' + config.page.dfpAccountId + '/' + adUnitOverride :
            config.page.adUnit;
        var sizeOpts = getSizeOpts(sizes);
        var id = adSlotNode.id;
        var slot;

        if (adSlotNode.getAttribute('data-out-of-page')) {
            slot = window.googletag.defineOutOfPageSlot(adUnit, id).defineSizeMapping(sizeOpts.sizeMapping);
        } else {
            slot = window.googletag.defineSlot(adUnit, sizeOpts.size, id).defineSizeMapping(sizeOpts.sizeMapping);
        }

        slot.addService(window.googletag.pubads())
            .setTargeting('slot', slotTarget);

        return slot;
    }

    function getSizeOpts(sizes) {
        var sizeMapping = buildSizeMapping(sizes);
        // as we're using sizeMapping, pull out all the ad sizes, as an array of arrays
        var size = uniq(
            flatten(sizeMapping, true, function (map) { return map[1]; }),
            function (size) { return size[0] + '-' + size[1]; }
        );

        return {
            sizeMapping: sizeMapping,
            size: size
        };
    }

    /**
     * Builds and assigns the correct size map for a slot based on the breakpoints
     * attached to the element via data attributes.
     *
     * A new size map is created for a given slot. We then loop through each breakpoint
     * defined in the config, checking if that breakpoint has been set on the slot.
     *
     * If it has been defined, then we add that size to the size mapping.
     *
     */
    function buildSizeMapping(sizes) {
        var mapping = window.googletag.sizeMapping();

        detect.breakpoints
            .filter(function (_) { return _.name in sizes; })
            .forEach(function (_) {
                mapping.addSize([_.width, 0], sizes[_.name]);
            });

        return mapping.build();
    }
});
