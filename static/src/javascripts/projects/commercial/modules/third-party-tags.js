// @flow strict
/* A regionalised container for all the commercial tags. */

import $ from 'lib/$';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/template';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import externalContentContainerStr from 'raw-loader!common/views/commercial/external-content.html';
import { imrWorldwide } from 'commercial/modules/third-party-tags/imr-worldwide';
import { imrWorldwideLegacy } from 'commercial/modules/third-party-tags/imr-worldwide-legacy';
import { remarketing } from 'commercial/modules/third-party-tags/remarketing';
import { simpleReach } from 'commercial/modules/third-party-tags/simple-reach';
import { krux } from 'common/modules/commercial/krux';
import { ias } from 'commercial/modules/third-party-tags/ias';
import { inizio } from 'commercial/modules/third-party-tags/inizio';
import { initOutbrain } from 'commercial/modules/third-party-tags/outbrain';
import { doubleClickAdFree } from 'commercial/modules/third-party-tags/doubleclick-ad-free';
import { plista } from 'commercial/modules/third-party-tags/plista';
import { fbPixel } from 'commercial/modules/third-party-tags/facebook-pixel';

const loadExternalContentWidget = (): void => {
    const externalTpl = template(externalContentContainerStr);

    const findAnchor = (): Promise<HTMLElement | null> => {
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
        // flowlint sketchy-null-bool:warn
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
        krux,
        ias,
        inizio,
        doubleClickAdFree,
        fbPixel(),
    ].filter(_ => _.shouldRun);

    if (services.length) {
        insertScripts(services);
    }
};

const init = (): Promise<boolean> => {
    if (!commercialFeatures.thirdPartyTags) {
        return Promise.resolve(false);
    }

    // Outbrain/Plista needs to be loaded before the first ad as it is checking
    // for the presence of high relevance component on page
    if (!commercialFeatures.adFree) {
        loadExternalContentWidget();
    }

    loadOther();

    return Promise.resolve(true);
};

export { init };
export const _ = { insertScripts, loadOther };
