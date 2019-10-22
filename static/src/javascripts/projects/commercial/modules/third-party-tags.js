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
import { twitterUwt } from 'commercial/modules/third-party-tags/twitter-uwt';
import { onIabConsentNotification } from '@guardian/consent-management-platform';

let adScriptsInserted: boolean = false;

const addScripts = (services: Array<ThirdPartyTag>): void => {
    const ref = document.scripts[0];
    const frag = document.createDocumentFragment();
    let hasScriptsToInsert = false;

    services.forEach(service => {
        if (service.useImage === true) {
            new Image().src = service.url;
        } else {
            hasScriptsToInsert = true;
            const script = document.createElement('script');
            script.src = service.url;
            script.onload = service.onLoad;
            frag.appendChild(script);
        }
    });

    if (hasScriptsToInsert) {
        fastdom.write(() => {
            if (ref && ref.parentNode) {
                ref.parentNode.insertBefore(frag, ref);
            }
        });
    }
};

const insertScripts = (
    adServices: Array<ThirdPartyTag>,
    nonAdServices: Array<ThirdPartyTag>
): void => {
    addScripts(nonAdServices);

    onIabConsentNotification(state => {
        const consentState =
            state[1] && state[2] && state[3] && state[4] && state[5];

        if (!adScriptsInserted && consentState) {
            addScripts(adServices);
            adScriptsInserted = true;
        }
    });
};

const loadOther = (): void => {
    const adServices: Array<ThirdPartyTag> = [
        remarketing(),
        simpleReach,
        krux,
        ias,
        inizio,
        fbPixel(),
        twitterUwt(),
    ].filter(_ => _.shouldRun);

    const nonAdServices: Array<ThirdPartyTag> = [
        imrWorldwide,
        imrWorldwideLegacy,
    ].filter(_ => _.shouldRun);

    insertScripts(adServices, nonAdServices);
};

const init = (): Promise<boolean> => {
    if (!commercialFeatures.thirdPartyTags) {
        return Promise.resolve(false);
    }

    // Section 1
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
export const _ = {
    insertScripts,
    loadOther,
    reset: () => {
        adScriptsInserted = false;
    },
};
