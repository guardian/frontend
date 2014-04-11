define([
    'common/utils/config'
], function (config) {

    var segments = {
        'sport': ['FKSWod', '2xivTZ'],
        'football': ['FKSWod', '2xivTZ'],
        'lifeandstyle': ['TQV1_5', 'J0tykU'],
        'technology': ['9a9VRE', 'TL3gqK'],
        'fashion': ['TQV1_5', 'J0tykU'],
        'childrens-books-site': [],
        'news': ['eMdl6Y', 'mMYVrM'],
        'default': ['c7Zrhu', 'Y1C40a']
    };

    function addSegments(targeting) {
        if (config.switches.audienceScienceGateway) {

            var targetedSegments = segments[config.page.section];
            if (targetedSegments === null) {
                targetedSegments = segments['default'];
            }

            targetedSegments.foreach(function (segment) {
                targeting['pq_' + segment] = '';
            });
        }
    }

    return {
        addSegments: addSegments
    };

});
