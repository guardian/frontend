// @flow
import { getUrlVars } from 'lib/url';
import config from 'lib/config';
import detect from 'lib/detect';
import uniq from 'lodash/arrays/uniq';
import flatten from 'lodash/arrays/flatten';
import once from 'lodash/functions/once';
import prepareSwitchTag from 'commercial/modules/dfp/prepare-switch-tag';

const adUnit = once(() => {
    const urlVars = getUrlVars();
    return urlVars['ad-unit']
        ? `/${config.page.dfpAccountId}/${urlVars['ad-unit']}`
        : config.page.adUnit;
});

type SizeMappingArray = Array<Object>;

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
const buildSizeMapping = (sizes: Object): SizeMappingArray => {
    const mapping = window.googletag.sizeMapping();

    detect.breakpoints.filter(_ => _.name in sizes).forEach(_ => {
        mapping.addSize([_.width, 0], sizes[_.name]);
    });

    return mapping.build();
};

const getSizeOpts = (sizesByBreakpoint: Object): Object => {
    const sizeMapping = buildSizeMapping(sizesByBreakpoint);
    // as we're using sizeMapping, pull out all the ad sizes, as an array of arrays
    const sizes = uniq(
        flatten(sizeMapping, true, map => map[1]),
        size => `${size[0]}-${size[1]}`
    );

    return {
        sizeMapping,
        sizes,
    };
};

const defineSlot = (adSlotNode: Element, sizes: Object): Object => {
    const slotTarget = adSlotNode.getAttribute('data-name');
    const sizeOpts = getSizeOpts(sizes);
    const id = adSlotNode.id;
    let slot;
    let slotReady;

    if (adSlotNode.getAttribute('data-out-of-page')) {
        slot = window.googletag
            .defineOutOfPageSlot(adUnit(), id)
            .defineSizeMapping(sizeOpts.sizeMapping);
        slotReady = Promise.resolve();
    } else {
        slot = window.googletag
            .defineSlot(adUnit(), sizeOpts.sizes, id)
            .defineSizeMapping(sizeOpts.sizeMapping);
        slotReady = prepareSwitchTag.maybePushAdUnit(id, sizeOpts);
    }

    if (slotTarget === 'im' && config.page.isbn) {
        slot.setTargeting('isbn', config.page.isbn);
    }

    slot.addService(window.googletag.pubads()).setTargeting('slot', slotTarget);

    return {
        slot,
        slotReady,
    };
};

export { defineSlot };
