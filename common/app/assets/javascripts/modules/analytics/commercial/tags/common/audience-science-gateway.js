define([
    'common/utils/config',
    'pinkySwear'
], function (
    config,
    pinkySwear
) {

    var audienceScienceGatewayUrl = '//pq-direct.revsci.net/pql',
        sectionSegments = {
            sport: ['FKSWod', '2xivTZ'],
            football: ['FKSWod', '2xivTZ'],
            lifeandstyle: ['TQV1_5', 'J0tykU'],
            technology: ['9a9VRE', 'TL3gqK'],
            fashion: ['TQV1_5', 'J0tykU'],
            'childrens-books-site': [],
            news: ['eMdl6Y', 'mMYVrM'],
            'default': ['c7Zrhu', 'Y1C40a']
        },
        getSegmentsPromise = pinkySwear(),
        load = function() {
            var segments = sectionSegments[config.page.section] || sectionSegments['default'],
                query =
                    [
                        ['placementIdList', segments.join(',')],
                        ['cb', new Date().getTime()]
                    ].map(function(queryPart) { return queryPart.join('='); }).join('&'),
                url = [audienceScienceGatewayUrl, '?', query].join('');

            require(['js!' + url + '!exports=asiPlacements'])
                .then(function(asiPlacements) {
                    var userSegments = {};
                    for (var segment in asiPlacements) {
                        userSegments['pq_' + segment] = asiPlacements[segment].defaults ? 'T' : '';
                    }
                    getSegmentsPromise(true, [userSegments]);
                });

        },
        getSegments = function() {
            return getSegmentsPromise;
        };

    return {
        load: load,
        getSegments: getSegments
    };

});
