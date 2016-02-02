/**
 * A regionalised container for all the commercial tags.
 */
define([
    'Promise',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/third-party-tags/audience-science-gateway',
    'common/modules/commercial/third-party-tags/audience-science-pql',
    'common/modules/commercial/third-party-tags/imr-worldwide',
    'common/modules/commercial/third-party-tags/remarketing',
    'common/modules/commercial/third-party-tags/krux',
    'common/modules/identity/api',
    'common/modules/commercial/third-party-tags/outbrain',
    'common/modules/commercial/third-party-tags/plista'
], function (
    Promise,
    config,
    detect,
    mediator,
    commercialFeatures,
    audienceScienceGateway,
    audienceSciencePql,
    imrWorldwide,
    remarketing,
    krux,
    identity,
    outbrain,
    plista) {

    function loadExternalContentWidget() {
        if (config.switches.plistaForOutbrainAu && config.page.edition.toLowerCase() == 'au') {
            plista.init();
        } else {
            outbrain.init();
        }
    }

    function init() {

        if (!commercialFeatures.thirdPartyTags) {
            return false;
        }

        switch (config.page.edition.toLowerCase()) {
            case 'uk':
                audienceSciencePql.load();
                audienceScienceGateway.load();
                break;
        }

        // Outbrain/Plista needs to be loaded before first ad as it is checking for presence of high relevance component on page
        loadExternalContentWidget();

        loadOther();
        return Promise.resolve(null);
    }

    function loadOther() {
        imrWorldwide.load();
        remarketing.load();
        krux.load();
    }

    return {
        init: init
    };
});
