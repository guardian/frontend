define([
    'common/utils/config',
    'common/utils/storage',
    'common/utils/url',
    'lodash/functions/once',
    'lodash/objects/pairs',
    'lodash/arrays/zipObject',
    'lodash/collections/map',
    'lodash/collections/filter',
    'common/utils/chain'
], function (config, storage, urlUtils, once, pairs, zipObject, map, filter, chain) {

    var gatewayUrl = '//pq-direct.revsci.net/pql';
    var storageKey = 'gu.ads.audsci-gateway';
    var sectionPlacements = {
        sport:        ['FKSWod', '2xivTZ', 'MTLELH'],
        football:     ['6FaXJO', 'ORE2W-', 'MTLELH'],
        lifeandstyle: ['TQV1_5', 'J0tykU', 'kLC9nW', 'MTLELH'],
        technology:   ['9a9VRE', 'TL3gqK', 'MTLELH'],
        fashion:      ['TQV1_5', 'J0tykU', 'kLC9nW', 'MTLELH'],
        news:         ['eMdl6Y', 'mMYVrM', 'MTLELH'],
        'default':    ['FLh9mM', 'c7Zrhu', 'Y1C40a', 'LtKGsC', 'MTLELH']
    };
    var section = sectionPlacements[config.page.section] ? config.page.section : 'default';
    var audienceSciencePqlUrl = getUrl();

    function getUrl() {
        var placements = sectionPlacements[section];
        var query = urlUtils.constructQuery({
            placementIdList: placements.join(','),
            cb: new Date().getTime()
        });
        return [gatewayUrl, '?', query].join('');
    }

    function load() {
        return require(['js!' + audienceSciencePqlUrl], onLoad);
    }

    function onLoad() {
        var asiPlacements = window.asiPlacements;
        var segments = storage.local.get(storageKey) || {};
        // override the global value with our previously stored one
        window.asiPlacements = segments[section];
        segments[section] = asiPlacements;
        storage.local.set(storageKey, segments);
    }

    function getSegments() {
        var segments = {},
            storedSegments = storage.local.get(storageKey);
        if (config.switches.audienceScienceGateway && storedSegments) {
            segments = chain(pairs(storedSegments[section])).and(filter, function (placement) {
                    //keyword `default` written in dot notation throws an exception IE8
                    return placement[1]['default']; //eslint-disable-line
                }).and(map, function (placement) {
                    return ['pq_' + placement[0], 'T'];
                }).and(zipObject).valueOf();
            // set up the global asiPlacements var in case dfp returns before asg
            window.asiPlacements = storedSegments[section];
        }
        return segments;
    }

    return {
        shouldRun: config.switches.audienceScienceGateway,
        url: audienceSciencePqlUrl,
        load: load,
        onLoad: onLoad,
        getSegments: getSegments
    };

});
