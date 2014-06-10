/**
 * A regionalised container for all the commercial tags.
 */
define([
    'common/modules/analytics/commercial/tags/common/audience-science',
    'common/modules/analytics/commercial/tags/common/audience-science-gateway',
    'common/modules/analytics/commercial/tags/common/imrworldwide',
    'common/modules/analytics/commercial/tags/common/media-math',
    'common/modules/analytics/commercial/tags/common/criteo',
    'common/modules/analytics/commercial/tags/au/amaa',
    'common/modules/analytics/commercial/tags/au/effective-measure'
], function(
    audienceScience,
    audienceScienceGateway,
    imrWorldwide,
    mediaMath,
    criteo,
    amaa,
    effectiveMeasure
) {

    function init(config) {

        switch (config.page.edition.toLowerCase()) {

            case 'au':

                if (config.switches.amaa) {
                    amaa.load();
                }

                if (config.switches.effectiveMeasure) {
                    effectiveMeasure.load();
                }

                if (config.switches.imrWorldwide) {
                    imrWorldwide.load();
                }

                break;

            default:

                if (config.switches.audienceScience) {
                    audienceScience.load();
                }
                audienceScienceGateway.load();

                if (config.switches.imrWorldwide) {
                    imrWorldwide.load();
                }

                break;
        }

        mediaMath.load();
        criteo.load();
    }

    return {
        init: init
    };

});
