define([
    'common/utils/config',
    'common/utils/storage',
    'common/utils/url'
], function (config, storage, urlUtils) {

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
        return gatewayUrl + '?' + query;
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
        var segments = {};
        var storedSegments = storage.local.get(storageKey);
        if (
            config.switches.audienceScienceGateway &&
            storedSegments &&
            storedSegments[section]
        ) {
            segments = Object.keys(storedSegments[section])
                .filter(function (placement) {
                    //keyword `default` written in dot notation throws an exception IE8
                    return storedSegments[section][placement]['default']; //eslint-disable-line
                }).map(function (placement) {
                    return ['pq_' + placement, 'T'];
                }).reduce(function (result, input) {
                    result[input[0]] = input[1];
                    return result;
                }, {});
            // set up the global asiPlacements var in case dfp returns before asg
            window.asiPlacements = storedSegments[section];
        }
        return segments;
    }

    return {
        shouldRun: config.switches.audienceScienceGateway,
        url: audienceSciencePqlUrl,
        reset: function () {
            section = sectionPlacements[config.page.section] ? config.page.section : 'default';
        },
        onLoad: onLoad,
        getSegments: getSegments
    };

});
