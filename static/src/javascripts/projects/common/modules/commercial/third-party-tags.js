/**
 * A regionalised container for all the commercial tags.
 */
define([
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/fastdom-promise',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/third-party-tags/audience-science-gateway',
    'common/modules/commercial/third-party-tags/audience-science-pql',
    'common/modules/commercial/third-party-tags/imr-worldwide',
    'common/modules/commercial/third-party-tags/remarketing',
    'common/modules/commercial/third-party-tags/krux',
    'common/modules/identity/api',
    'common/modules/commercial/third-party-tags/outbrain',
    'common/modules/commercial/third-party-tags/plista',
    'tpl!common/views/commercial/external-content.html'
], function (
    Promise,
    $,
    config,
    detect,
    mediator,
    fastdom,
    commercialFeatures,
    audienceScienceGateway,
    audienceSciencePql,
    imrWorldwide,
    remarketing,
    krux,
    identity,
    outbrain,
    plista,
    externalTpl
    ) {

    function loadExternalContentWidget() {

        var documentAnchorClass = '.js-external-content-widget-anchor';

        function renderWidgetContainer(widgetType) {
            $(documentAnchorClass).append(externalTpl({widgetType: widgetType}));
        }

        if (config.switches.plistaForOutbrainAu && config.page.edition.toLowerCase() === 'au') {
            fastdom.write(function () {
                renderWidgetContainer('plista');
            }).then(plista.init);
        } else {
            fastdom.write(function () {
                renderWidgetContainer('outbrain');
            }).then(outbrain.init);
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
