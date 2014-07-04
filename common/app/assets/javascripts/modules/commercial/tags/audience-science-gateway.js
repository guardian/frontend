define([
    'lodash/functions/once',
    'common/utils/config',
    'common/utils/url'
], function (
    once,
    config,
    urlUtils
) {

    var gatewayUrl = '//pq-direct.revsci.net/pql',
        sectionPlacements = {
            sport:        ['FKSWod', '2xivTZ', 'MTLELH'],
            football:     ['6FaXJO', 'ORE2W-', 'MTLELH'],
            lifeandstyle: ['TQV1_5', 'J0tykU', 'kLC9nW', 'MTLELH'],
            technology:   ['9a9VRE', 'TL3gqK', 'MTLELH'],
            fashion:      ['TQV1_5', 'J0tykU', 'kLC9nW', 'MTLELH'],
            news:         ['eMdl6Y', 'mMYVrM', 'MTLELH'],
            'default':    ['c7Zrhu', 'Y1C40a', 'LtKGsC', 'MTLELH']
        },
        segments = [],
        load = once(function() {
            if (config.switches.audienceScience) {
                var placements = sectionPlacements[config.page.section] || sectionPlacements['default'],
                    query = urlUtils.constructQuery({
                            placementIdList: placements.join(','),
                            cb: new Date().getTime()
                        }),
                    url = [gatewayUrl, '?', query].join('');

                return require(['js!' + url + '!exports=asiPlacements'])
                    .then(function(asiPlacements) {
                        for (var placement in asiPlacements) {
                            segments['pq_' + placement] = asiPlacements[placement]['default'] ? 'T' : '';
                        }
                    });
            }
        }),
        getSegments = function() {
            return segments;
        };

    return {
        load: load,
        getSegments: getSegments
    };

});
