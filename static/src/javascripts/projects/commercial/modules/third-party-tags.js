// @flow
/* A regionalised container for all the commercial tags. */

import $ from 'lib/$';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/utilities/template';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';
import { getTestVariantId } from 'common/modules/experiments/utils';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import PaidContentVsOutbrain2 from 'common/modules/experiments/tests/paid-content-vs-outbrain';
import externalContentContainerStr from 'raw-loader!common/views/commercial/external-content.html';
import { imrWorldwide } from 'commercial/modules/third-party-tags/imr-worldwide';
import { imrWorldwideLegacy } from 'commercial/modules/third-party-tags/imr-worldwide-legacy';
import { remarketing } from 'commercial/modules/third-party-tags/remarketing';
import { simpleReach } from 'commercial/modules/third-party-tags/simple-reach';
import { tourismAustralia } from 'commercial/modules/third-party-tags/tourism-australia';
import { krux } from 'commercial/modules/third-party-tags/krux';
import { initOutbrain } from 'commercial/modules/third-party-tags/outbrain';
import plista from 'commercial/modules/third-party-tags/plista';

const isLuckyBastard = (): boolean =>
    testCanBeRun(PaidContentVsOutbrain2) &&
    getTestVariantId(PaidContentVsOutbrain2.id) === 'paid-content';

const loadExternalContentWidget = (): void => {
    const externalTpl = template(externalContentContainerStr);

    const findAnchor = (): Promise<any> => {
        const selector = !(config.page.seriesId || config.page.blogIds)
            ? '.js-related, .js-outbrain-anchor'
            : '.js-outbrain-anchor';
        return Promise.resolve(document.querySelector(selector));
    };

    const renderWidget = (widgetType, init): void => {
        findAnchor()
            .then(anchorNode =>
                fastdom.write(() => {
                    $(anchorNode).after(
                        externalTpl({
                            widgetType,
                        })
                    );
                })
            )
            .then(init);
    };

    const shouldServePlista: boolean =
        config.switches.plistaForOutbrainAu &&
        config.page.edition.toLowerCase() === 'au';

    if (shouldServePlista) {
        renderWidget('plista', plista.init);
    } else {
        renderWidget('outbrain', initOutbrain);
    }
};

const insertScripts = (services: Array<ThirdPartyTag>): void => {
    const ref = document.scripts[0];
    const frag = document.createDocumentFragment();
    while (services.length) {
        const service = services.shift();
        if (service.useImage) {
            new Image().src = service.url;
        } else {
            const script = document.createElement('script');
            script.src = service.url;
            script.onload = service.onLoad;
            frag.appendChild(script);
        }
    }
    if (ref && ref.parentNode) {
        ref.parentNode.insertBefore(frag, ref);
    }
};

const loadOther = (): void => {
    const services: Array<ThirdPartyTag> = [
        imrWorldwide,
        imrWorldwideLegacy,
        remarketing,
        simpleReach,
        tourismAustralia,
        krux,
    ].filter(_ => _.shouldRun);

    if (services.length) {
        insertScripts(services);
    }
};

export const initThirdPartyTags = (): Promise<any> => {
    if (!commercialFeatures.thirdPartyTags) {
        return Promise.resolve(false);
    }

    // Outbrain/Plista needs to be loaded before the first ad as it is checking
    // for the presence of high relevance component on page
    if (!isLuckyBastard()) {
        loadExternalContentWidget();
    }

    loadOther();

    return Promise.resolve(true);
};

export const _ = { insertScripts, loadOther };
