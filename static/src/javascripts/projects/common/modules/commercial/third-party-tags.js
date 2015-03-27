/**
 * A regionalised container for all the commercial tags.
 */
define([
    'Promise',
    'common/utils/config',
    'common/modules/commercial/third-party-tags/amaa',
    'common/modules/commercial/third-party-tags/audience-science',
    'common/modules/commercial/third-party-tags/audience-science-gateway',
    'common/modules/commercial/third-party-tags/criteo',
    'common/modules/commercial/third-party-tags/effective-measure',
    'common/modules/commercial/third-party-tags/imr-worldwide',
    'common/modules/commercial/third-party-tags/remarketing',
    'common/modules/commercial/third-party-tags/krux',
    'common/modules/commercial/third-party-tags/outbrain'
], function (
    Promise,
    config,
    amaa,
    audienceScience,
    audienceScienceGateway,
    criteo,
    effectiveMeasure,
    imrWorldwide,
    remarketing,
    krux,
    outbrain
) {

    function init() {

        if (config.page.contentType === 'Identity' || config.page.section === 'identity') {
            return false;
        }

        switch (config.page.edition.toLowerCase()) {
            case 'au':
                effectiveMeasure.load();
                amaa.load();
                break;

            case 'uk':
                audienceScienceGateway.load();
                break;
        }

        audienceScience.load();
        criteo.load();
        imrWorldwide.load();
        remarketing.load();
        outbrain.load();
        krux.load();

        return Promise.resolve(null);
    }

    return {
        init: init
    };
});
