define([
    'common/utils/url',
    'common/utils/config',
    'common/utils/detect',
    'lodash/arrays/uniq',
    'lodash/arrays/flatten'
], function (urlUtils, config, detect, uniq, flatten) {
    return defineSlot;

    function defineSlot(adSlotNode, sizes) {
        var slotTarget = adSlotNode.getAttribute('data-slot-target') || adSlotNode.getAttribute('data-name');
        var adUnitOverride = urlUtils.getUrlVars()['ad-unit'];
        // if ?ad-unit=x, use that
        var adUnit = adUnitOverride ?
            '/' + config.page.dfpAccountId + '/' + adUnitOverride :
            config.page.adUnit;
        var id = adSlotNode.id;
        var slot;

        if (adSlotNode.getAttribute('data-out-of-page')) {
            slot = window.googletag.defineOutOfPageSlot(adUnit, id);
        } else {
            slot = createInPageSlot(adUnit, id, sizes);
        }

        setTargeting(adSlotNode, slot, 'data-series', 'se');
        setTargeting(adSlotNode, slot, 'data-keywords', 'k');

        slot.addService(window.googletag.pubads())
            .setTargeting('slot', slotTarget);

        return slot;
    }

    function createInPageSlot(adUnit, id, sizes) {
        var sizeMapping = buildSizeMapping(sizes);
        // as we're using sizeMapping, pull out all the ad sizes, as an array of arrays
        var size = uniq(
            flatten(sizeMapping, true, function (map) { return map[1]; }),
            function (size) { return size[0] + '-' + size[1]; }
        );

        return window.googletag.defineSlot(adUnit, size, id).defineSizeMapping(sizeMapping);
    }

    function setTargeting(adSlotNode, slot, attribute, targetKey) {
        var data = adSlotNode.getAttribute(attribute);
        if (data) {
            slot.setTargeting(targetKey, parseKeywords(data));
        }
    }

    function parseKeywords(keywords) {
        return (keywords || '').split(',').map(function (keyword) {
            return keyword.substr(keyword.lastIndexOf('/') + 1);
        });
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
