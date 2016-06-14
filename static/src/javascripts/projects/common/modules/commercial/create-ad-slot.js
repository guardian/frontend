define([
    'common/utils/config',
    'common/utils/assign',
    'common/modules/commercial/ad-sizes',
    'lodash/objects/transform'
], function (
    config,
    assign,
    adSizes,
    transform
) {
    var fabricTopSlot = '88,71';
    var fluidSlot = config.switches.fluidAdverts ? '|fluid' : '';
    var adSlotDefinitions = {
        right: {
            sizeMappings: {
                mobile:  compile(
                    adSizes.outOfPage,
                    adSizes.mpu,
                    adSizes.halfPage,
                    config.page.edition === 'US' ? adSizes.portrait : null
                )
            }
        },
        'right-sticky': {
            name: 'right',
            sizeMappings: {
                mobile:  compile(
                    adSizes.outOfPage,
                    adSizes.mpu,
                    adSizes.stickyMpu,
                    adSizes.halfPage,
                    config.page.edition === 'US' ? adSizes.portrait : null
                )
            }
        },
        'right-small': {
            name: 'right',
            sizeMappings: {
                mobile:  compile(adSizes.outOfPage, adSizes.mpu)
            }
        },
        im: {
            label: false,
            refresh: false,
            sizeMappings: {
                mobile: compile(adSizes.outOfPage, adSizes.inlineMerchandising)
            }
        },
        inline1: {
            sizeMappings: {
                mobile: compile(
                    adSizes.outOfPage,
                    adSizes.mpu,
                    adSizes.fabric,
                    config.switches.fluidAdverts ? adSizes.fluid : null
                ),
                tablet: compile(
                    adSizes.outOfPage,
                    adSizes.mpu,
                    config.switches.fluidAdverts ? adSizes.fluid : null
                )
            }
        },
        inline: {
            sizeMappings: {
                mobile: compile(adSizes.outOfPage, adSizes.mpu)
            }
        },
        mostpop: {
            sizeMappings: {
                mobile: compile(adSizes.outOfPage, adSizes.mpu)
            }
        },
        'merchandising-high': {
            label: false,
            refresh: false,
            sizeMappings: {
                mobile: compile(adSizes.outOfPage, adSizes.merchandising)
            }
        },
        spbadge: {
            label: false,
            refresh: false,
            sizeMappings: {
                mobile: compile(adSizes.outOfPage, adSizes.badge)
            }
        },
        adbadge: {
            label: false,
            refresh: false,
            sizeMappings: {
                mobile: compile(adSizes.outOfPage, adSizes.badge)
            }
        },
        fobadge: {
            label: false,
            refresh: false,
            sizeMappings: {
                mobile: compile(adSizes.outOfPage, adSizes.badge)
            }
        },
        comments: {
            sizeMappings: {
                mobile:  compile(adSizes.outOfPage, adSizes.badge)
            }
        },
        'top-above-nav': {
            sizeMappings: {
                desktop: compile(
                    adSizes.outOfPage,
                    adSizes.fluid250,
                    adSizes.leaderboard,
                    adSizes.cascase,
                    adSizes.superHeader,
                    adSizes.billboard,
                    adSizes.fabric
                )
            }
        }
    };

    function compile(size1) {
        var result = size1;
        for (var i = 1, ii = arguments.length; i < ii; i++) {
            if (arguments[i]) {
                result += '|' + arguments[i];
            }
        }
        return result;
    }

    function createAdSlotElement(name, attrs, classes) {
        var adSlot = document.createElement('div');
        adSlot.id = 'dfp-ad--' + name;
        adSlot.className = 'js-ad-slot ad-slot ad-slot--dfp ' + classes.join(' ');
        adSlot.setAttribute('data-link-name', 'ad slot ' + name);
        adSlot.setAttribute('data-test-id', 'ad-slot-' + name);
        adSlot.setAttribute('data-name', name);
        Object.keys(attrs).forEach(function (attr) { adSlot.setAttribute(attr, attrs[attr]); });
        return adSlot;
    }

    return function (name, slotTypes, series, keywords, slotTarget) {
        var slotName = slotTarget ? slotTarget : name,
            attributes = {},
            definition,
            classes = [];

        definition = adSlotDefinitions[slotName] || adSlotDefinitions.inline;
        name = definition.name || name;

        if (config.page.hasPageSkin && slotName === 'merchandising-high') {
            definition.sizeMappings.wide = adSizes.outOfPage;
        }

        assign(attributes, definition.sizeMappings);

        if (definition.label === false) {
            attributes.label = 'false';
        }

        if (definition.refresh === false) {
            attributes.refresh = 'false';
        }

        if (slotTarget) {
            attributes['slot-target'] = slotTarget;
        }

        if (series) {
            attributes.series = series;
        }

        if (keywords) {
            attributes.keywords = keywords;
        }

        if (slotTypes) {
            classes = (Array.isArray(slotTypes) ? slotTypes : [slotTypes]).map(function (type) {
                return 'ad-slot--' + type;
            });
        }

        classes.push('ad-slot--' + name.replace(/((?:ad|fo|sp)badge).*/, '$1'));

        return createAdSlotElement(
            name,
            Object.keys(attributes).reduce(function (result, key) {
                result['data-' + key] = attributes[key];
                return result;
            }, {}),
            classes
        );
    };

});
