// @flow
import { adSizes } from 'commercial/modules/ad-sizes';

const inlineDefinition = {
    sizeMappings: {
        mobile: [
            adSizes.outOfPage,
            adSizes.empty,
            adSizes.outstreamMobile,
            adSizes.mpu,
            adSizes.googleCard,
            adSizes.fluid,
        ],
        phablet: [
            adSizes.outOfPage,
            adSizes.empty,
            adSizes.outstreamMobile,
            adSizes.mpu,
            adSizes.googleCard,
            adSizes.outstreamDesktop,
            adSizes.fluid,
        ],
        desktop: [
            adSizes.outOfPage,
            adSizes.empty,
            adSizes.mpu,
            adSizes.googleCard,
            adSizes.video,
            adSizes.outstreamDesktop,
            adSizes.fluid,
        ],
    },
};

const adSlotDefinitions = {
    im: {
        label: false,
        refresh: false,
        sizeMappings: {
            mobile: [
                adSizes.outOfPage,
                adSizes.empty,
                adSizes.inlineMerchandising,
                adSizes.fluid,
            ],
        },
    },
    'high-merch': {
        label: false,
        refresh: false,
        name: 'merchandising-high',
        sizeMappings: {
            mobile: [
                adSizes.outOfPage,
                adSizes.empty,
                adSizes.merchandisingHigh,
                adSizes.fluid,
            ],
        },
    },
    'high-merch-lucky': {
        label: false,
        refresh: false,
        name: 'merchandising-high-lucky',
        sizeMappings: {
            mobile: [adSizes.outOfPage, adSizes.empty, adSizes.fluid],
        },
    },
    'high-merch-paid': {
        label: false,
        refresh: false,
        name: 'merchandising-high',
        sizeMappings: {
            mobile: [
                adSizes.outOfPage,
                adSizes.empty,
                adSizes.merchandisingHighAdFeature,
                adSizes.fluid,
            ],
        },
    },
    inline: inlineDefinition,
    mostpop: inlineDefinition,
    comments: inlineDefinition,
    'top-above-nav': {
        sizeMappings: {
            mobile: [
                adSizes.outOfPage,
                adSizes.empty,
                adSizes.fabric,
                adSizes.outstreamMobile,
                adSizes.mpu,
                adSizes.fluid,
            ],
        },
    },
    carrot: {
        label: false,
        refresh: false,
        name: 'carrot',
        sizeMappings: {
            mobile: [adSizes.fluid],
        },
    },
    epic: {
        label: false,
        refresh: false,
        name: 'epic',
        sizeMappings: {
            mobile: [adSizes.fluid],
        },
    },
    'mobile-sticky': {
        label: true,
        refresh: true,
        name: 'mobile-sticky',
        sizeMappings: {
            mobile: [adSizes.mobilesticky],
        },
    },
};

/*
  Returns an array of adSlot HTMLElement(s) with always at least one HTMLDivElement
  which is the main DFP slot.

  Insert those elements as siblings at the place
  you want adverts to appear.

  Note that for the DFP slot to be filled by GTP, you'll have to
  use addSlot from add-slot.js
*/
const createAdSlotElements = (
    name: string,
    attrs: Object,
    classes: Array<string>
) => {
    const adSlots = [];

    // The 'main' adSlot
    const adSlot: HTMLDivElement = document.createElement('div');
    adSlot.id = `dfp-ad--${name}`;
    adSlot.className = `js-ad-slot ad-slot ${classes.join(' ')}`;
    adSlot.setAttribute('data-link-name', `ad slot ${name}`);
    adSlot.setAttribute('data-name', name);
    adSlot.setAttribute('aria-hidden', 'true');
    Object.keys(attrs).forEach(attr => {
        adSlot.setAttribute(attr, attrs[attr]);
    });

    adSlots.push(adSlot);

    return adSlots;
};

export const createSlots = (type: string, options: Object = {}) => {
    const attributes = {};
    const definition: Object = adSlotDefinitions[type];
    const slotName = options.name || definition.name || type;
    const classes = options.classes
        ? options.classes.split(' ').map(cn => `ad-slot--${cn}`)
        : [];

    const sizes = Object.assign({}, definition.sizeMappings);

    if (options.sizes) {
        Object.keys(options.sizes).forEach(size => {
            if (sizes[size]) {
                sizes[size] = sizes[size].concat(options.sizes[size]);
            } else {
                sizes[size] = options.sizes[size];
            }
        });
    }

    Object.keys(sizes).forEach(size => {
        sizes[size] = sizes[size].join('|');
    });

    Object.assign(attributes, sizes);

    if (definition.label === false) {
        attributes.label = 'false';
    }

    if (definition.refresh === false) {
        attributes.refresh = 'false';
    }

    classes.push(`ad-slot--${slotName}`);

    return createAdSlotElements(
        slotName,
        Object.keys(attributes).reduce(
            (result, key) =>
                Object.assign({}, result, { [`data-${key}`]: attributes[key] }),
            {}
        ),
        classes
    );
};
