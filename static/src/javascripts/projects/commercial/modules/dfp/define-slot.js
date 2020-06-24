// @flow
import { getUrlVars } from 'lib/url';
import config from 'lib/config';
import { breakpoints } from 'lib/detect';
import uniqBy from 'lodash/uniqBy';
import flatten from 'lodash/flatten';
import once from 'lodash/once';
import type { Slot } from 'commercial/types';

const adUnit = once(() => {
    const urlVars = getUrlVars();
    return urlVars['ad-unit']
        ? `/${config.get('page.dfpAccountId')}/${urlVars['ad-unit']}`
        : config.get('page.adUnit');
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

    breakpoints
        .filter(_ => _.name in sizes)
        .forEach(_ => {
            mapping.addSize([_.width, 0], sizes[_.name]);
        });

    return mapping.build();
};

const getSizeOpts = (sizesByBreakpoint: Object): Object => {
    const sizeMapping = buildSizeMapping(sizesByBreakpoint);
    // as we're using sizeMapping, pull out all the ad sizes, as an array of arrays
    const sizes = uniqBy(
        flatten(sizeMapping.map(size => size[1])),
        size => `${size[0]}-${size[1]}`
    );

    return {
        sizeMapping,
        sizes,
    };
};

const adomikClassify = (): string => {
    const rand = Math.random();

    switch (true) {
        case rand < 0.09:
            return `ad_ex${Math.floor(100 * rand)}`;
        case rand < 0.1:
            return 'ad_bc';
        default:
            return 'ad_opt';
    }
};

const isEligibleForOutstream = (slotTarget: ?string): boolean =>
    typeof slotTarget === 'string' &&
    (slotTarget === 'inline1' || slotTarget === 'top-above-nav');

const allowSafeFrameToExpand = (slot: Slot): Slot => {
    slot.setSafeFrameConfig({
        allowOverlayExpansion: false,
        allowPushExpansion: true,
        sandbox: true,
    });
    return slot;
};

const defineSlot = (adSlotNode: Element, sizes: Object): Object => {
    const slotTarget = adSlotNode.getAttribute('data-name');
    const sizeOpts = getSizeOpts(sizes);
    const id = adSlotNode.id;
    let slot;
    let slotReady = Promise.resolve();

    if (adSlotNode.getAttribute('data-out-of-page')) {
        slot = window.googletag
            .defineOutOfPageSlot(adUnit(), id)
            .defineSizeMapping(sizeOpts.sizeMapping);
    } else {
        slot = window.googletag
            .defineSlot(adUnit(), sizeOpts.sizes, id)
            .defineSizeMapping(sizeOpts.sizeMapping);
        if (isEligibleForOutstream(slotTarget)) {
            allowSafeFrameToExpand(slot);
        }
    }

    /*
        For each ad slot defined, we request information from IAS, based
        on slot name, ad unit and sizes. We then add this targeting to the
        slot prior to requesting it from DFP.

        We race the request to IAS with a Timeout of 2 seconds. If the
        timeout resolves before the request to IAS then the slot is defined
        without the additional IAS data.

        To see debugging output from IAS add the URL param `&iasdebug=true` to the page URL
     */
    if (config.get('switches.iasAdTargeting', false)) {
        /* eslint-disable no-underscore-dangle */
        // this should all have been instantiated by commercial/modules/third-party-tags/ias.js
        window.__iasPET = window.__iasPET || {};
        const iasPET = window.__iasPET;
        /* eslint-disable no-underscore-enable */

        iasPET.queue = iasPET.queue || [];
        iasPET.pubId = '10249';

        // IAS Optimization Targeting
        const iasPETSlots = [
            {
                adSlotId: id,
                size: slot
                    .getSizes()
                    .filter(size => size !== 'fluid')
                    .map(size => [size.getWidth(), size.getHeight()]),
                adUnitPath: adUnit(), // why do we have this method and not just slot.getAdUnitPath()?
            },
        ];

        // this is stored so that the timeout can be cancelled in the event of IAS not timing out
        let timeoutId;

        // this is resolved by either the iasTimeout or iasDataCallback, defined below
        let loadedResolve;
        const iasDataPromise = new Promise(resolve => {
            loadedResolve = resolve;
        });

        const iasDataCallback = targetingJSON => {
            clearTimeout(timeoutId);

            /*  There is a name-clash with the `fr` targeting returned by IAS
                and the `fr` paramater we already use for frequency. Therefore
                we apply the targeting to the slot ourselves and rename the IAS
                fr parameter to `fra` (given that, here, it relates to fraud).
            */
            const targeting = JSON.parse(targetingJSON);

            // brand safety is on a page level
            Object.keys(targeting.brandSafety).forEach(key =>
                window.googletag
                    .pubads()
                    .setTargeting(key, targeting.brandSafety[key])
            );
            if (targeting.fr) {
                window.googletag.pubads().setTargeting('fra', targeting.fr);
            }
            if (targeting.custom && targeting.custom['ias-kw']) {
                window.googletag
                    .pubads()
                    .setTargeting('ias-kw', targeting.custom['ias-kw']);
            }

            // viewability targeting is on a slot level
            const ignoredKeys = ['pub'];
            Object.keys(targeting.slots[id])
                .filter(x => !ignoredKeys.includes(x))
                .forEach(key =>
                    slot.setTargeting(key, targeting.slots[id][key])
                );

            loadedResolve();
        };

        iasPET.queue.push({
            adSlots: iasPETSlots,
            dataHandler: iasDataCallback,
        });

        const iasTimeoutDuration = 1000;

        const iasTimeout = () =>
            new Promise(resolve => {
                timeoutId = setTimeout(resolve, iasTimeoutDuration);
            });

        slotReady = Promise.race([iasTimeout(), iasDataPromise]);
    }
    const isBn = config.get('page.isbn');

    if (slotTarget === 'im' && isBn) {
        slot.setTargeting('isbn', isBn);
    }

    const fabricKeyValues = new Map([
        ['top-above-nav', 'fabric1'],
        ['merchandising-high', 'fabric2'],
        ['merchandising', 'fabric3'],
    ]);

    if (fabricKeyValues.has(slotTarget)) {
        slot.setTargeting('slot-fabric', fabricKeyValues.get(slotTarget));
    }

    if (config.get('switches.adomik')) {
        slot.setTargeting('ad_group', adomikClassify());
        slot.setTargeting('ad_h', new Date().getUTCHours().toString());
    }

    slot.addService(window.googletag.pubads()).setTargeting('slot', slotTarget);

    return {
        slot,
        slotReady,
    };
};

export { defineSlot };
