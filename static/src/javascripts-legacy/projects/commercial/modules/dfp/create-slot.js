define([
    'lib/config',
    'lodash/objects/assign',
    'commercial/modules/ad-sizes'
], function (
    config,
    assign,
    adSizes
) {
    var inlineDefinition = {
        sizeMappings: {
            mobile: [adSizes.outOfPage, adSizes.empty, adSizes.mpu, adSizes.fluid],
            desktop: [adSizes.outOfPage, adSizes.empty, adSizes.mpu, adSizes.video, adSizes.video2, adSizes.fluid]
        }
    };

    var adSlotDefinitions = {
        im: {
            label: false,
            refresh: false,
            sizeMappings: {
                mobile: [adSizes.outOfPage, adSizes.empty, adSizes.inlineMerchandising, adSizes.fluid]
            }
        },
        'high-merch': {
            label: false,
            refresh: false,
            name: 'merchandising-high',
            sizeMappings: {
                mobile: [adSizes.outOfPage, adSizes.empty, adSizes.merchandisingHigh, adSizes.fluid]
            }
        },
        'high-merch-lucky': {
            label: false,
            refresh: false,
            name: 'merchandising-high-lucky',
            sizeMappings: {
                mobile: [adSizes.outOfPage, adSizes.empty, adSizes.fluid]
            }
        },
        'high-merch-paid': {
            label: false,
            refresh: false,
            name: 'merchandising-high',
            sizeMappings: {
                mobile: [adSizes.outOfPage, adSizes.empty, adSizes.merchandisingHighAdFeature, adSizes.fluid]
            }
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
                    adSizes.fluid
                ]
            }
        }
    };

    function createAdSlotElement(name, attrs, classes) {
        var adSlot = document.createElement('div');
        adSlot.id = 'dfp-ad--' + name;
        adSlot.className = 'js-ad-slot ad-slot ' + classes.join(' ');
        adSlot.setAttribute('data-link-name', 'ad slot ' + name);
        adSlot.setAttribute('data-name', name);
        Object.keys(attrs).forEach(function (attr) { adSlot.setAttribute(attr, attrs[attr]); });
        return adSlot;
    }

    return function (type, options) {
        var attributes = {};
        var slotName, definition, classes, sizes;

        options    = options || {};
        definition = adSlotDefinitions[type];
        slotName   = options.name || definition.name || type;
        classes    = options.classes ?
            options.classes.split(' ').map(function(cn) { return 'ad-slot--' + cn; }) :
            [];
        sizes      = assign({}, definition.sizeMappings);

        if (options.sizes) {
            Object.keys(options.sizes).forEach(function (size) {
                if (sizes[size]) {
                    sizes[size] = sizes[size].concat(options.sizes[size]);
                } else {
                    sizes[size] = options.sizes[size];
                }
            });
        }

        Object.keys(sizes).forEach(function (size) {
            sizes[size] = sizes[size].join('|');
        });

        assign(attributes, sizes);

        if (definition.label === false) {
            attributes.label = 'false';
        }

        if (definition.refresh === false) {
            attributes.refresh = 'false';
        }

        classes.push('ad-slot--' + slotName);

        return createAdSlotElement(
            slotName,
            Object.keys(attributes).reduce(function (result, key) {
                result['data-' + key] = attributes[key];
                return result;
            }, {}),
            classes
        );
    };

});
