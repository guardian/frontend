define([
    'common/utils/config',
    'common/utils/assign',
    'common/modules/commercial/ad-sizes'
], function (
    config,
    assign,
    adSizes
) {
    var inlineDefinition = {
        sizeMappings: {
            mobile: compile(adSizes.outOfPage, adSizes.empty, adSizes.mpu, adSizes.fluid),
            desktop: compile(adSizes.outOfPage, adSizes.empty, adSizes.mpu, adSizes.video, adSizes.video2, adSizes.fluid)
        }
    };

    var rightMappings = {
        mobile: compile(
            adSizes.outOfPage,
            adSizes.empty,
            adSizes.mpu,
            adSizes.halfPage,
            config.page.edition === 'US' ? adSizes.portrait : null,
            adSizes.fluid
        )
    };

    var adSlotDefinitions = {
        right: {
            sizeMappings: rightMappings
        },
        'right-sticky': {
            name: 'right',
            sizeMappings: rightMappings
        },
        'right-small': {
            name: 'right',
            sizeMappings: {
                mobile: compile(adSizes.outOfPage, adSizes.empty, adSizes.mpu, adSizes.fluid)
            }
        },
        im: {
            label: false,
            refresh: false,
            sizeMappings: {
                mobile: compile(adSizes.outOfPage, adSizes.empty, adSizes.inlineMerchandising, adSizes.fluid)
            }
        },
        'high-merch': {
            label: false,
            refresh: false,
            name: 'merchandising-high',
            sizeMappings: {
                mobile: compile(adSizes.outOfPage, adSizes.empty, adSizes.merchandisingHigh, adSizes.fluid)
            }
        },
        'high-merch-paid': {
            label: false,
            refresh: false,
            name: 'merchandising-high',
            sizeMappings: {
                mobile: compile(adSizes.outOfPage, adSizes.empty, adSizes.merchandisingHighAdFeature, adSizes.fluid)
            }
        },
        inline: inlineDefinition,
        mostpop: inlineDefinition,
        comments: inlineDefinition,
        'top-above-nav': {
            sizeMappings: {
                mobile: compile(
                    adSizes.outOfPage,
                    adSizes.empty,
                    adSizes.mpu,
                    adSizes.fabric,
                    adSizes.fluid
                )
            }
        }
    };

    function compile(size1) {
        var result = size1;
        for (var i = 1; i < arguments.length; i++) {
            if (arguments[i]) {
                result += '|' + arguments[i];
            }
        }
        return result;
    }

    function createAdSlotElement(name, attrs, classes) {
        var adSlot = document.createElement('div');
        adSlot.id = 'dfp-ad--' + name;
        adSlot.className = 'js-ad-slot ad-slot ' + classes.join(' ');
        adSlot.setAttribute('data-link-name', 'ad slot ' + name);
        adSlot.setAttribute('data-name', name);
        Object.keys(attrs).forEach(function (attr) { adSlot.setAttribute(attr, attrs[attr]); });
        return adSlot;
    }

    return function (name, slotTypes) {
        var slotName = name,
            attributes = {},
            definition,
            classes = [];

        definition = adSlotDefinitions[slotName] || adSlotDefinitions.inline;
        name = definition.name || name;

        assign(attributes, definition.sizeMappings);

        if (definition.label === false) {
            attributes.label = 'false';
        }

        if (definition.refresh === false) {
            attributes.refresh = 'false';
        }

        if (slotTypes) {
            classes = (Array.isArray(slotTypes) ? slotTypes : [slotTypes]).map(function (type) {
                return 'ad-slot--' + type;
            });
        }

        classes.push('ad-slot--' + name);

        var adSlot = createAdSlotElement(
            name,
            Object.keys(attributes).reduce(function (result, key) {
                result['data-' + key] = attributes[key];
                return result;
            }, {}),
            classes
        );

        return adSlot;
    };

});
