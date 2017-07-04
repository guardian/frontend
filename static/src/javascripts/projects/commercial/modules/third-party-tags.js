// @flow
/* A regionalised container for all the commercial tags. */

import $ from 'lib/$';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/utilities/template';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';
import { getTestVariantId } from 'common/modules/experiments/utils';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import audienceScienceGateway from 'commercial/modules/third-party-tags/audience-science-gateway';
import audienceSciencePql from 'commercial/modules/third-party-tags/audience-science-pql';
import PaidContentVsOutbrain2 from 'common/modules/experiments/tests/paid-content-vs-outbrain';
import externalContentContainerStr from 'raw-loader!common/views/commercial/external-content.html';

// third-party-tags follow an API pattern with their exports, FlowTyped as
// 'Service'. To avoid naming collisions, namespace imports are used here.
/* eslint-disable import/no-namespace */
import * as imrWorldwide from 'commercial/modules/third-party-tags/imr-worldwide';
import * as imrWorldwideLegacy from 'commercial/modules/third-party-tags/imr-worldwide-legacy';
import * as remarketing from 'commercial/modules/third-party-tags/remarketing';
import * as simpleReach from 'commercial/modules/third-party-tags/simple-reach';
import * as tourismAustralia from 'commercial/modules/third-party-tags/tourism-australia';
import * as krux from 'commercial/modules/third-party-tags/krux';
import * as outbrain from 'commercial/modules/third-party-tags/outbrain';
import * as plista from 'commercial/modules/third-party-tags/plista';

type Service = {
    shouldRun: boolean,
    url: string,
    onLoad?: () => any,
    useImage?: boolean,
};

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

    const renderWidget = (widgetType, init: () => void): void => {
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
        renderWidget('plista', plista.default.init);
    } else {
        renderWidget('outbrain', outbrain.init);
    }
};

const insertScripts = (services: Array<Service>): void => {
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
    if (ref.parentNode) {
        ref.parentNode.insertBefore(frag, ref);
    }
};

const loadOther = (): void => {
    const services = [
        audienceSciencePql,
        audienceScienceGateway,
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

const init = (): Promise<any> => {
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

export { init };
