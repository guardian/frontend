/**
 * A regionalised container for all the commercial tags.
 */
define([
    'lodash/objects/defaults',
    'common/utils/config',
    'common/modules/commercial/outbrain',
    'common/modules/commercial/tags/amaa',
    'common/modules/commercial/tags/audience-science',
    'common/modules/commercial/tags/audience-science-gateway',
    'common/modules/commercial/tags/criteo',
    'common/modules/commercial/tags/effective-measure',
    'common/modules/commercial/tags/imrworldwide',
    'common/modules/commercial/tags/media-math',
    'common/modules/commercial/tags/remarketing',
    'common/modules/commercial/tags/krux'
], function (
    defaults,
    config,
    outbrain,
    amaa,
    audienceScience,
    audienceScienceGateway,
    criteo,
    effectiveMeasure,
    imrWorldwide,
    mediaMath,
    remarketing,
    krux
) {

    function init() {

        if (config.page.contentType === 'Identity' || config.page.section === 'identity') {
            return false;
        }

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
        outbrain.load();
        krux.load();
    }

    return {
        init: init
    };

});
