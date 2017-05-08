/**
 * A regionalised container for all the commercial tags.
 */
define([
    'lib/$',
    'lib/config',
    'lib/fastdom-promise',
    'lodash/utilities/template',
    'common/modules/experiments/ab',
    'commercial/modules/commercial-features',
    'commercial/modules/third-party-tags/audience-science-gateway',
    'commercial/modules/third-party-tags/audience-science-pql',
    'commercial/modules/third-party-tags/imr-worldwide',
    'commercial/modules/third-party-tags/imr-worldwide-legacy',
    'commercial/modules/third-party-tags/remarketing',
    'commercial/modules/third-party-tags/simple-reach',
    'commercial/modules/third-party-tags/tourism-australia',
    'commercial/modules/third-party-tags/krux',
    'commercial/modules/third-party-tags/outbrain',
    'commercial/modules/third-party-tags/plista',
    'raw-loader!common/views/commercial/external-content.html'
], function (
    $,
    config,
    fastdom,
    template,
    ab,
    commercialFeatures,
    audienceScienceGateway,
    audienceSciencePql,
    imrWorldwide,
    imrWorldwideLegacy,
    remarketing,
    simpleReach,
    tourismAustralia,
    krux,
    outbrain,
    plista,
    externalContentContainerStr
    ) {

    function loadExternalContentWidget() {

        var externalTpl = template(externalContentContainerStr);

        function findAnchor() {
            var selector = !(config.page.seriesId || config.page.blogIds) ?
                '.js-related, .js-outbrain-anchor' :
                '.js-outbrain-anchor';
            return Promise.resolve(document.querySelector(selector));
        }

        function renderWidget(widgetType, init) {
            findAnchor()
            .then(function (anchorNode) {
                return fastdom.write(function () {
                    $(anchorNode).after(externalTpl({widgetType: widgetType}));
                })
            })
            .then(init);
        }

        var shouldServePlista = config.switches.plistaForOutbrainAu && config.page.edition.toLowerCase() === 'au';

        if (shouldServePlista) {
            renderWidget('plista', plista.init);
        } else {
            renderWidget('outbrain', outbrain.init);
        }
    }

    function init() {

        if (!commercialFeatures.thirdPartyTags) {
            return Promise.resolve(false);
        }

        // Outbrain/Plista needs to be loaded before first ad as it is checking for presence of high relevance component on page
        if (!isLuckyBastard()) {
            loadExternalContentWidget();
        }

        loadOther();

        return Promise.resolve(true);
    }

    function isLuckyBastard() {
        var testName = 'PaidContentVsOutbrain2';
        return ab.testCanBeRun(testName) && ab.getTestVariantId(testName) === 'paid-content';
    }

    function loadOther() {
        var services = [
            audienceSciencePql,
            audienceScienceGateway,
            imrWorldwide,
            imrWorldwideLegacy,
            remarketing,
            simpleReach,
            tourismAustralia,
            krux
        ].filter(function (_) { return _.shouldRun; });

        if (services.length) {
            insertScripts(services);
        }
    }

    function insertScripts(services) {
        var ref = document.scripts[0];
        var frag = document.createDocumentFragment();
        while (services.length) {
            var service = services.shift();
            if (service.useImage) {
                new Image().src = service.url;
            } else {
                var script = document.createElement('script');
                script.src = service.url;
                script.onload = service.onLoad;
                frag.appendChild(script);
            }
        }
        ref.parentNode.insertBefore(frag, ref);
    }

    return {
        init: init
    };
});
