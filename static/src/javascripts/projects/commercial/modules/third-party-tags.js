/**
 * A regionalised container for all the commercial tags.
 */
import $ from 'lib/$';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/utilities/template';
import testCanRunChecks from 'common/modules/experiments/test-can-run-checks';
import abUtils from 'common/modules/experiments/utils';
import commercialFeatures from 'commercial/modules/commercial-features';
import audienceScienceGateway from 'commercial/modules/third-party-tags/audience-science-gateway';
import audienceSciencePql from 'commercial/modules/third-party-tags/audience-science-pql';
import imrWorldwide from 'commercial/modules/third-party-tags/imr-worldwide';
import imrWorldwideLegacy from 'commercial/modules/third-party-tags/imr-worldwide-legacy';
import remarketing from 'commercial/modules/third-party-tags/remarketing';
import simpleReach from 'commercial/modules/third-party-tags/simple-reach';
import tourismAustralia from 'commercial/modules/third-party-tags/tourism-australia';
import krux from 'commercial/modules/third-party-tags/krux';
import outbrain from 'commercial/modules/third-party-tags/outbrain';
import plista from 'commercial/modules/third-party-tags/plista';
import PaidContentVsOutbrain2 from 'common/modules/experiments/tests/paid-content-vs-outbrain';
import externalContentContainerStr from 'raw-loader!common/views/commercial/external-content.html';

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
            .then(function(anchorNode) {
                return fastdom.write(function() {
                    $(anchorNode).after(externalTpl({
                        widgetType: widgetType
                    }));
                })
            })
            .then(init);
    }

    var shouldServePlista = config.switches.plistaForOutbrainAu && config.page.edition.toLowerCase() === 'au';

    if (shouldServePlista) {
        renderWidget('plista', plista.default.init);
    } else {
        renderWidget('outbrain', outbrain.init);
    }
}

function init() {

    if (!commercialFeatures.commercialFeatures.thirdPartyTags) {
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
    return testCanRunChecks.testCanBeRun(PaidContentVsOutbrain2) &&
        abUtils.getTestVariantId(PaidContentVsOutbrain2.id) === 'paid-content';
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
    ].filter(function(_) {
        return _.shouldRun;
    });

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

export default {
    init: init
};
