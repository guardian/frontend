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
    'common/utils/template',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/third-party-tags/audience-science-gateway',
    'common/modules/commercial/third-party-tags/audience-science-pql',
    'common/modules/commercial/third-party-tags/imr-worldwide',
    'common/modules/commercial/third-party-tags/remarketing',
    'common/modules/commercial/third-party-tags/krux',
    'common/modules/identity/api',
    'common/modules/commercial/third-party-tags/outbrain',
    'common/modules/commercial/third-party-tags/plista',
    'text!common/views/commercial/external-content.html'
], function (
    Promise,
    $,
    config,
    detect,
    mediator,
    fastdom,
    template,
    commercialFeatures,
    audienceScienceGateway,
    audienceSciencePql,
    imrWorldwide,
    remarketing,
    krux,
    identity,
    outbrain,
    plista,
    externalContentContainerStr
    ) {

    function loadExternalContentWidget() {

        var externalTpl = template(externalContentContainerStr);
        var documentAnchorClass = '.js-external-content-widget-anchor';

        function renderWidgetContainer(widgetType) {
            $(documentAnchorClass).append(externalTpl({widgetType: widgetType}));
        }

        var isMobileOrTablet = ['mobile', 'tablet'].indexOf(detect.getBreakpoint(false)) >= 0;
        var shouldIgnoreSwitch =  isMobileOrTablet || config.page.section === 'world' || config.page.edition.toLowerCase() !== 'au';
        var shouldServePlista = config.switches.plistaForOutbrainAu && !shouldIgnoreSwitch;

        if (shouldServePlista) {
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

        // Outbrain/Plista needs to be loaded before first ad as it is checking for presence of high relevance component on page
        loadExternalContentWidget();

        loadOther();
        return Promise.resolve(null);
    }

    function loadOther() {
        var services = [
            config.page.edition === 'UK' ? audienceSciencePql : null,
            config.page.edition === 'UK' ? audienceScienceGateway : null,
            imrWorldwide,
            remarketing,
            krux
        ].filter(function (_) { return _ && _.shouldRun; });

        if (services.length) {
            insertScripts(services);
        }
    }

    function insertScripts(services) {
        var ref = document.scripts[0];
        var frag = document.createDocumentFragment();
        while (services.length) {
            var service = services.shift();
            var script = document.createElement('script');
            script.src = service.url;
            script.onload = service.onLoad;
            frag.appendChild(script);
        }
        ref.parentNode.insertBefore(frag, ref);
    }

    return {
        init: init
    };
});
