define(['lib/config', 'lib/url'], function(config, urlUtils) {
    var gatewayUrl = '//pq-direct.revsci.net/pql';
    var sectionPlacements = {
        sport: ['FKSWod', '2xivTZ', 'MTLELH'],
        football: ['6FaXJO', 'ORE2W-', 'MTLELH'],
        lifeandstyle: ['TQV1_5', 'J0tykU', 'kLC9nW', 'MTLELH'],
        technology: ['9a9VRE', 'TL3gqK', 'MTLELH'],
        fashion: ['TQV1_5', 'J0tykU', 'kLC9nW', 'MTLELH'],
        news: ['eMdl6Y', 'mMYVrM', 'MTLELH'],
        default: ['FLh9mM', 'c7Zrhu', 'Y1C40a', 'LtKGsC', 'MTLELH'],
    };
    var section = sectionPlacements[config.page.section]
        ? config.page.section
        : 'default';
    var audienceSciencePqlUrl = getUrl();

    function getUrl() {
        var placements = sectionPlacements[section];
        var query = urlUtils.constructQuery({
            placementIdList: placements.join(','),
            cb: new Date().getTime(),
        });
        return gatewayUrl + '?' + query;
    }

    function onLoad() {
        window.googletag.cmd.push(
            setAudienceScienceCallback,
            setAudienceScienceKeys
        );
    }

    function getSegments() {
        var placements = window.asiPlacements || {};
        return Object.keys(placements)
            .filter(function(placement) {
                return placements[placement].default;
            })
            .map(function(placement) {
                return 'pq_' + placement;
            });
    }

    function setAudienceScienceKeys() {
        getSegments().forEach(addKey);
    }

    // Remove all Audience Science related targeting keys as soon as we recieve
    // an AS creative (will get called by the creative itself)
    function setAudienceScienceCallback() {
        window.onAudienceScienceCreativeLoaded = function() {
            getSegments().forEach(removeKey);
        };
    }

    function addKey(key) {
        window.googletag.pubads().setTargeting(key, 'T');
    }

    function removeKey(key) {
        window.googletag.pubads().clearTargeting(key);
    }

    return {
        shouldRun:
            config.page.edition === 'UK' &&
                config.switches.audienceScienceGateway,
        url: audienceSciencePqlUrl,
        reset: function() {
            section = sectionPlacements[config.page.section]
                ? config.page.section
                : 'default';
        },
        onLoad: onLoad,
        getSegments: getSegments,
    };
});
