/**
 * A regionalised container for all the commercial tags.
 */
define([
    'common/modules/analytics/commercial/tags/common/audience-science',
    'common/modules/analytics/commercial/tags/common/audience-science-gateway',
    'common/modules/analytics/commercial/tags/common/imrworldwide',
    'common/modules/analytics/commercial/tags/common/media-math',
    'common/modules/analytics/commercial/tags/common/criteo',
    'common/modules/analytics/commercial/tags/common/remarketing',
    'common/modules/analytics/commercial/tags/au/amaa',
    'common/modules/analytics/commercial/tags/au/effective-measure'
], function(
    audienceScience,
    audienceScienceGateway,
    imrWorldwide,
    mediaMath,
    criteo,
    remarketing,
    amaa,
    effectiveMeasure
) {

    function init(config) {

        switch (config.page.edition.toLowerCase()) {
            case 'au':
                amaa.load();
                effectiveMeasure.load();
                break;

            default:
                audienceScience.load();
                audienceScienceGateway.load();
                break;
        }

        mediaMath.load();
        criteo.load();
        imrWorldwide.load();
        remarketing.load();
    }

    return {
        init: init
    };

});
