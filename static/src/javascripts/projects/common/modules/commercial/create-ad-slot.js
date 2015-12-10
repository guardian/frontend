define([
    'common/utils/$',
    'common/utils/config',
    'lodash/collections/map',
    'lodash/objects/assign',
    'lodash/objects/isArray',
    'lodash/objects/transform'
], function (
    $,
    config,
    map,
    assign,
    isArray,
    transform
) {
    var adSlotDefinitions = {
        right: {
            sizeMappings: {
                mobile:  '1,1|300,250|300,600' + (config.page.edition === 'US' ? '|300,1050' : '')
            }
        },
        'right-sticky': {
            name: 'right',
            sizeMappings: {
                mobile:  '1,1|300,250|300,251|300,600' + (config.page.edition === 'US' ? '|300,1050' : '')
            }
        },
        'right-small': {
            name: 'right',
            sizeMappings: {
                mobile:  '1,1|300,250'
            }
        },
        im: {
            label: false,
            refresh: false,
            sizeMappings: {
                mobile: '1,1|88,85'
            }
        },
        inline1: {
            sizeMappings: {
                mobile:             '1,1|300,250',
                'mobile-landscape': '1,1|300,250',
                tablet:             '1,1|300,250'
            }
        },
        inline: {
            sizeMappings: {
                mobile:             '1,1|300,250',
                'mobile-landscape': '1,1|300,250',
                tablet:             '1,1|300,250'
            }
        },
        mostpop: {
            sizeMappings: {
                mobile:             '1,1|300,250',
                'mobile-landscape': '1,1|300,250',
                tablet:             '1,1|300,250'
            }
        },
        'merchandising-high': {
            label: false,
            refresh: false,
            sizeMappings: {
                mobile: '1,1|88,87'
            }
        },
        spbadge: {
            label: false,
            refresh: false,
            sizeMappings: {
                mobile: '1,1|140,90'
            }
        },
        adbadge: {
            label: false,
            refresh: false,
            sizeMappings: {
                mobile: '1,1|140,90'
            }
        },
        fobadge: {
            label: false,
            refresh: false,
            sizeMappings: {
                mobile: '1,1|140,90'
            }
        },
        comments: {
            sizeMappings: {
                mobile:  '1,1|300,250'
            }
        },
        'top-above-nav': {
            sizeMappings: {
                desktop: '1,1|88,70|728,90|940,230|900,250|970,250'
            }
        }
    };

    function createAdSlotElement(name, attrs, classes) {
        return $.create('<div></div>')
            .attr({
                'id': 'dfp-ad--' + name,
                'data-link-name': 'ad slot ' + name,
                'data-test-id': 'ad-slot-' + name,
                'data-name': name
            })
            .attr(attrs)
            .addClass('js-ad-slot ad-slot ad-slot--dfp ' + classes.join(' '));
    }

    return function (name, types, series, keywords, slotTarget) {
        var slotName = slotTarget ? slotTarget : name,
            attributes = {},
            definition,
            classes,
            $adSlot;

        definition = adSlotDefinitions[slotName] || adSlotDefinitions.inline;
        name = definition.name || name;

        if (config.page.hasPageSkin && slotName === 'merchandising-high') {
            definition.sizeMappings.wide = '1,1';
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

        if (types) {
            classes = map((isArray(types) ? types : [types]), function (type) {
                return 'ad-slot--' + type;
            });
        }

        classes.push('ad-slot--' + name.replace(/((?:ad|fo|sp)badge).*/, '$1'));

        $adSlot = createAdSlotElement(
            name,
            transform(attributes, function (result, size, key) {
                result['data-' + key] = size;
            }, {}),
            classes
        );

        return $adSlot[0];
    };

});
