// @flow strict
/* A regionalised container for all the commercial tags. */

import fastdom from 'lib/fastdom-promise';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { imrWorldwide } from 'commercial/modules/third-party-tags/imr-worldwide';
import { imrWorldwideLegacy } from 'commercial/modules/third-party-tags/imr-worldwide-legacy';
import { remarketing } from 'commercial/modules/third-party-tags/remarketing';
import { simpleReach } from 'commercial/modules/third-party-tags/simple-reach';
import { krux } from 'common/modules/commercial/krux';
import { ias } from 'commercial/modules/third-party-tags/ias';
import { inizio } from 'commercial/modules/third-party-tags/inizio';
import { fbPixel } from 'commercial/modules/third-party-tags/facebook-pixel';
import { init as initPlistaOutbrainRenderer } from 'commercial/modules/third-party-tags/plista-outbrain-renderer';

const insertScripts = (services: Array<ThirdPartyTag>): void => {
    const ref = document.scripts[0];
    const frag = document.createDocumentFragment();
    let insertedScripts = false;

    services.forEach(service => {
        // flowlint sketchy-null-bool:warn
        if (service.useImage) {
            new Image().src = service.url;
        } else {
            insertedScripts = true;
            const script = document.createElement('script');
            script.src = service.url;
            script.onload = service.onLoad;
            frag.appendChild(script);
        }
    });

    fastdom.write(() => {
        if (insertedScripts && ref && ref.parentNode) {
            ref.parentNode.insertBefore(frag, ref);
        }
    });
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
        fbPixel(),
    ].filter(_ => _.shouldRun);

    insertScripts(services);
};

const init = (): Promise<boolean> => {
    if (!commercialFeatures.thirdPartyTags) {
        return Promise.resolve(false);
    }

    // Outbrain/Plista needs to be loaded before the first ad as it is checking
    // for the presence of high relevance component on page
    // I'm leaving this to check adFree state because while the thirdPartyTags
    // check above is now sensitive to ad-free, it could be changed independently
    // in the future - even by accident.  Justin.
    if (!commercialFeatures.adFree) {
        initPlistaOutbrainRenderer();
    }

    loadOther();

    return Promise.resolve(true);
};

export { init };
export const _ = { insertScripts, loadOther };
