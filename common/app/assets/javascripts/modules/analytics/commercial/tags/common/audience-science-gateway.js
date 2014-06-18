define([
    'lodash/functions/once',
    'common/utils/config'
], function (
    once,
    config
) {

    var gatewayUrl = '//pq-direct.revsci.net/pql',
        sectionPlacements = {
            sport:        ['FKSWod', '2xivTZ'],
            football:     ['6FaXJO', 'ORE2W-'],
            lifeandstyle: ['TQV1_5', 'J0tykU', 'kLC9nW'],
            technology:   ['9a9VRE', 'TL3gqK'],
            fashion:      ['TQV1_5', 'J0tykU', 'kLC9nW'],
            news:         ['eMdl6Y', 'mMYVrM'],
            'default':    ['c7Zrhu', 'Y1C40a', 'LtKGsC', 'MTLELH']
        },
        segments = [],
        load = once(function() {
            if (config.switches.audienceScience) {
                var placements = sectionPlacements[config.page.section] || sectionPlacements['default'],
                    query = [
                            ['placementIdList', placements.join(',')],
                            ['cb', new Date().getTime()]
                        ].map(function(queryPart) { return queryPart.join('='); }).join('&'),
                    url = [gatewayUrl, '?', query].join('');

                return require(['js!' + url + '!exports=asiPlacements'])
                    .then(function(asiPlacements) {
                        for (var placement in asiPlacements) {
                            segments['pq_' + placement] = asiPlacements[placement].defaults ? 'T' : '';
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
