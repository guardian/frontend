define([
    'lodash/arrays/zipObject',
    'lodash/functions/once',
    'lodash/objects/pairs',
    'common/utils/config',
    'common/utils/storage',
    'common/utils/url'
], function (
    zipObject,
    once,
    pairs,
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
            'default':    ['c7Zrhu', 'Y1C40a', 'LtKGsC', 'MTLELH']
        },
        section = sectionPlacements[config.page.section] ? config.page.section : 'default',
        load = once(function() {
            if (config.switches.audienceScienceGateway) {
                var placements = sectionPlacements[section],
                    query = urlUtils.constructQuery({
                        placementIdList: placements.join(','),
                        cb: new Date().getTime()
                    }),
                    url = [gatewayUrl, '?', query].join('');

                return require(['js!' + url + '!exports=asiPlacements'])
                    .then(function(asiPlacements) {
                        var segments = storage.local.get(storageKey) || {};
                        segments[section] = zipObject(
                            pairs(asiPlacements)
                                .filter(function(placement) {
                                    return placement[1]['default'];
                                })
                                .map(function(placement) {
                                    return ['pq_' + placement[0], 'T'];
                                })
                        );
                        storage.local.set(storageKey, segments);
                    });
            }
        }),
        getSegments = function() {
            var segments = storage.local.get(storageKey);
            return segments ? segments[section] : {};
        };

    return {
        load: load,
        getSegments: getSegments
    };

});
