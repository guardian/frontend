define([
    'lodash/functions/once',
    'lodash/objects/assign',
    'lodash/objects/pairs',
    'common/utils/_',
    'common/utils/config',
    'common/utils/storage',
    'common/utils/url'
], function (
    once,
    assign,
    pairs,
    _,
    config,
    storage,
    urlUtils
) {

    var gatewayUrl = '//pq-direct.revsci.net/pql',
        storageKey = 'gu.ads.audsci-gateway',
        sectionPlacements = {
            sport:        ['FKSWod', '2xivTZ', 'MTLELH'],
            football:     ['6FaXJO', 'ORE2W-', 'MTLELH'],
            lifeandstyle: ['TQV1_5', 'J0tykU', 'kLC9nW', 'MTLELH'],
            technology:   ['9a9VRE', 'TL3gqK', 'MTLELH'],
            fashion:      ['TQV1_5', 'J0tykU', 'kLC9nW', 'MTLELH'],
            news:         ['eMdl6Y', 'mMYVrM', 'MTLELH'],
            'default':    ['FLh9mM', 'c7Zrhu', 'Y1C40a', 'LtKGsC', 'MTLELH']
        },
        section,
        init = function () {
            section = sectionPlacements[config.page.section] ? config.page.section : 'default';
        },
        load = once(function () {
            if (config.switches.audienceScienceGateway) {
                var placements = sectionPlacements[section],
                    query = urlUtils.constructQuery({
                        placementIdList: placements.join(','),
                        cb: new Date().getTime()
                    }),
                    url = [gatewayUrl, '?', query].join('');

                return require(['js!' + url + '!exports=asiPlacements'], function (asiPlacements) {
                    var segments = storage.local.get(storageKey) || {};
                    // override the global value with our previously stored one
                    window.asiPlacements = segments[section];
                    segments[section] = asiPlacements;
                    storage.local.set(storageKey, segments);
                });
            }
        }),
        getSegments = function () {
            var segments = {},
                storedSegments = storage.local.get(storageKey);
            if (config.switches.audienceScienceGateway && storedSegments) {
                segments = _(pairs(storedSegments[section]))
                    .filter(function (placement) {
                        return placement[1]['default'];
                    })
                    .map(function (placement) {
                        return ['pq_' + placement[0], 'T'];
                    })
                    .zipObject()
                    .valueOf();
                // set up the global asiPlacements var in case dfp returns before asg
                window.asiPlacements = storedSegments[section];
            }
            return segments;
        };

    init();

    return {
        load: load,
        getSegments: getSegments,
        init: init
    };

});
