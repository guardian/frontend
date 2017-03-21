define([
    'lib/url',
    'lib/config',
    'lib/detect',
    'lodash/arrays/uniq',
    'lodash/arrays/flatten',
    'lodash/functions/once',
    'commercial/modules/dfp/prepare-switch-tag'
], function (urlUtils, config, detect, uniq, flatten, once, prepareSwitchTag) {
    var adUnit = once(function () {
        var urlVars = urlUtils.getUrlVars();
        return urlVars['ad-unit'] ?
            '/' + config.page.dfpAccountId + '/' + urlVars['ad-unit'] :
            config.page.adUnit;
    });

    return defineSlot;

    function defineSlot(adSlotNode, sizes) {
        var slotTarget = adSlotNode.getAttribute('data-name');
        var sizeOpts = getSizeOpts(sizes);
        var id = adSlotNode.id;
        var slot;
        var slotReady;

        if (adSlotNode.getAttribute('data-out-of-page')) {
            slot = window.googletag.defineOutOfPageSlot(adUnit(), id).defineSizeMapping(sizeOpts.sizeMapping);
            slotReady = Promise.resolve();
        } else {
            slot = window.googletag.defineSlot(adUnit(), sizeOpts.size, id).defineSizeMapping(sizeOpts.sizeMapping);
            slotReady = prepareSwitchTag.pushAdUnit(id, sizeOpts);
        }

        if (slotTarget === 'im' && config.page.isbn) {
            slot.setTargeting('isbn', config.page.isbn);
        }

        slot.addService(window.googletag.pubads())
            .setTargeting('slot', slotTarget);

        return {
            slot: slot,
            slotReady: slotReady
        };
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
