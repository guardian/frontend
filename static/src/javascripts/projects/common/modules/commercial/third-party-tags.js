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

    function identityPolicy() {
        return (!(identity.isUserLoggedIn() && config.page.commentable));
    }

    function hasHighRelevanceComponent() {
        return detect.adblockInUse() || config.page.edition.toLowerCase() === 'int';
    }

    function shouldServeExternalContent() {
        return config.switches.outbrain
            && !config.page.isFront
            && !config.page.isPreview
            && identityPolicy()
            && config.page.section !== 'childrens-books-site';
    }

    function chooseExternalContentWidget() {
        if (config.switches.plistaForOutbrainAu && config.page.edition.toLowerCase() == 'au') {
            return plista;
        } else {
            return outbrain;
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
        if (shouldServeExternalContent()) {
            var widget = chooseExternalContentWidget();

            if (hasHighRelevanceComponent()) {
                widget.load();
            } else {
                mediator.on('modules:commercial:dfp:rendered', function (event) {
                    if (event.slot.getSlotId().getDomId() === 'dfp-ad--merchandising-high' && event.isEmpty) {
                        widget.load();
                    }
                });
            }
        }

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
