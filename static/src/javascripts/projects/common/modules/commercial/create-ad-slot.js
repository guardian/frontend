define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'text!common/views/commercial/ad-slot.html',
    'lodash/collections/map',
    'lodash/objects/isArray',
    'lodash/objects/pairs'
], function (
    $,
    config,
    detect,
    template,
    adSlotTpl,
    map,
    isArray,
    pairs) {
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
        }
    };

    return function (name, types, series, keywords, slotTarget) {
        var attrName,
            slotName = slotTarget ? slotTarget : name,
            definition,
            dataAttrs,
            $adSlot;

        definition = (slotName.match(/^inline/) && slotName !== 'inline1') ? adSlotDefinitions.inline : adSlotDefinitions[slotName];
        if (config.page.hasPageSkin && slotName === 'merchandising-high') {
            definition.sizeMappings.wide = '1,1';
        }
        dataAttrs  = {
            label:   definition.label !== undefined ? definition.label : true,
            refresh: definition.refresh !== undefined ? definition.refresh : true
        };
        $adSlot = $.create(template(
            adSlotTpl,
            {
                name: definition.name || name,
                // badges now append their index to the name
                normalisedName: (definition.name || name).replace(/((?:ad|fo|sp)badge).*/, '$1'),
                types: types ? map((isArray(types) ? types : [types]), function (type) {
                    return ' ad-slot--' + type;
                }).join('') : '',
                sizeMappings: map(pairs(definition.sizeMappings), function (size) {
                    return ' data-' + size[0] + '="' + size[1] + '"';
                }).join('')
            })
        );
        for (attrName in dataAttrs) {
            if (dataAttrs[attrName] === false) {
                $adSlot.attr('data-' + attrName, 'false');
            }
        }
        if (slotTarget) {
            $adSlot.attr('data-slot-target', slotTarget);
        }
        if (series) {
            $adSlot.attr('data-series', series);
        }
        if (keywords) {
            $adSlot.attr('data-keywords', keywords);
        }
        return $adSlot[0];
    };

});
