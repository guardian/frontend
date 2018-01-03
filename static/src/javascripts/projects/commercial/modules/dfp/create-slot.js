// @flow
import adSizes from 'commercial/modules/ad-sizes';

const inlineDefinition = {
    sizeMappings: {
        mobile: [adSizes.outOfPage, adSizes.empty, adSizes.mpu, adSizes.fluid],
        desktop: [
            adSizes.outOfPage,
            adSizes.empty,
            adSizes.mpu,
            adSizes.video,
            adSizes.video2,
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
                adSizes.mpu,
                adSizes.fabric,
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
};

const createAdSlotElement = (
    name: string,
    attrs: Object,
    classes: Array<string>
) => {
    const adSlot: HTMLDivElement = document.createElement('div');
    adSlot.id = `dfp-ad--${name}`;
    adSlot.className = `js-ad-slot ad-slot ${classes.join(' ')}`;
    adSlot.setAttribute('data-link-name', `ad slot ${name}`);
    adSlot.setAttribute('data-name', name);
    Object.keys(attrs).forEach(attr => {
        adSlot.setAttribute(attr, attrs[attr]);
    });
    return adSlot;
};

const createSlot = (type: string, options: Object = {}) => {
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

    return createAdSlotElement(
        slotName,
        Object.keys(attributes).reduce(
            (result, key) =>
                Object.assign({}, result, { [`data-${key}`]: attributes[key] }),
            {}
        ),
        classes
    );
};

export default createSlot;
