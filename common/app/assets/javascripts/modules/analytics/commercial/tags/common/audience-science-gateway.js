define([
    'common/utils/config'
], function (config) {

    function addSegments(targeting) {
        if (config.switches.audienceScienceGateway) {

            var segments;

            switch (config.page.section) {
                case 'sport':
                    segments = ['FKSWod', '2xivTZ'];
                    break;
                case 'football':
                    segments = ['FKSWod', '2xivTZ'];
                    break;
                case 'lifeandstyle':
                    segments = ['TQV1_5', 'J0tykU'];
                    break;
                case 'technology':
                    segments = ['9a9VRE', 'TL3gqK'];
                    break;
                case 'fashion':
                    segments = ['TQV1_5', 'J0tykU'];
                    break;
                case 'childrens-books-site':
                    segments = [];
                    break;
                case 'news':
                    segments = ['eMdl6Y', 'mMYVrM'];
                    break;
                default:
                    segments = ['c7Zrhu', 'Y1C40a'];
            }

            for (var i = 0; i < segments.length; i++) {
                targeting['pq_' + segments[i]] = '';
            }
        }
    }

    return {
        addSegments: addSegments
    };

});
