/**
 * A regionalised container for all the commercial tags.
 */
define([
    'Promise',
    'common/utils/config',
    'common/modules/commercial/third-party-tags/audience-science',
    'common/modules/commercial/third-party-tags/audience-science-gateway',
    'common/modules/commercial/third-party-tags/imr-worldwide',
    'common/modules/commercial/third-party-tags/remarketing',
    'common/modules/commercial/third-party-tags/krux',
    'common/modules/commercial/third-party-tags/outbrain',
    'common/modules/commercial/third-party-tags/pointroll-resp-lib'
], function (
    Promise,
    config,
    audienceScience,
    audienceScienceGateway,
    imrWorldwide,
    remarketing,
    krux,
    outbrain,
    pointroll
) {

    function init() {

        if (config.page.contentType === 'Identity' || config.page.section === 'identity') {
            return false;
        }

        switch (config.page.edition.toLowerCase()) {
            case 'uk':
                audienceScienceGateway.load();
                break;
        }

        audienceScience.load();
        imrWorldwide.load();
        remarketing.load();
        outbrain.load();
        krux.load();
        pointroll.load();

        return Promise.resolve(null);
    }

    return {
        init: init
    };
});
