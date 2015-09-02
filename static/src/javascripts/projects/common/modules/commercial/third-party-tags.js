/**
 * A regionalised container for all the commercial tags.
 */
define([
    'Promise',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/commercial/third-party-tags/audience-science-gateway',
    'common/modules/commercial/third-party-tags/audience-science-pql',
    'common/modules/commercial/third-party-tags/imr-worldwide',
    'common/modules/commercial/third-party-tags/remarketing',
    'common/modules/commercial/third-party-tags/krux',
    'common/modules/commercial/third-party-tags/outbrain'
], function (
    Promise,
    config,
    mediator,
    audienceScienceGateway,
    audienceSciencePql,
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
            case 'uk':
                audienceSciencePql.load();
                audienceScienceGateway.load();
                break;
        }

        // Outbrain needs to be loaded before first ad as it is checking for presence of high relevance component on page
        outbrain.init();
        // Load third parties after first ad was rendered
        mediator.once('modules:commercial:dfp:rendered', function () {
            loadOther();
        });

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
