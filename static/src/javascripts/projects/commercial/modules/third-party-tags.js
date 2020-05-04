// @flow strict
/* A regionalised container for all the commercial tags. */

import fastdom from 'lib/fastdom-promise';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { imrWorldwide } from 'commercial/modules/third-party-tags/imr-worldwide';
import { imrWorldwideLegacy } from 'commercial/modules/third-party-tags/imr-worldwide-legacy';
import { remarketing } from 'commercial/modules/third-party-tags/remarketing';
import { simpleReach } from 'commercial/modules/third-party-tags/simple-reach';
import { ias } from 'commercial/modules/third-party-tags/ias';
import { inizio } from 'commercial/modules/third-party-tags/inizio';
import { fbPixel } from 'commercial/modules/third-party-tags/facebook-pixel';
import { permutive } from 'commercial/modules/third-party-tags/permutive';
import { init as initPlistaRenderer } from 'commercial/modules/third-party-tags/plista-renderer';
import { twitterUwt } from 'commercial/modules/third-party-tags/twitter-uwt';
import { connatix } from 'commercial/modules/third-party-tags/connatix';
import {
    onIabConsentNotification,
    onGuConsentNotification,
} from '@guardian/consent-management-platform';

let advertisingScriptsInserted: boolean = false;
let performanceScriptsInserted: boolean = false;

const addScripts = (tags: Array<ThirdPartyTag>): void => {
    const ref = document.scripts[0];
    const frag = document.createDocumentFragment();
    let hasScriptsToInsert = false;

    tags.forEach(tag => {
        if (tag.useImage === true) {
            new Image().src = tag.url;
        } else {
            hasScriptsToInsert = true;
            const script = document.createElement('script');
            script.src = tag.url;
            script.onload = tag.onLoad;
            if (tag.async === true) {
                script.setAttribute('async', '');
            }
            if (tag.attrs) {
                tag.attrs.forEach(attr => {
                    script.setAttribute(attr.name, attr.value);
                });
            }
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
    advertisingServices: Array<ThirdPartyTag>,
    performanceServices: Array<ThirdPartyTag>
): void => {
    onGuConsentNotification('performance', state => {
        if (!performanceScriptsInserted && state) {
            addScripts(performanceServices);
            performanceScriptsInserted = true;
        }
    });

    onIabConsentNotification(state => {
        const consentState =
            state[1] && state[2] && state[3] && state[4] && state[5];

        if (!advertisingScriptsInserted && consentState) {
            addScripts(advertisingServices);
            advertisingScriptsInserted = true;
        }
    });
};

const loadOther = (): void => {
    const advertisingServices: Array<ThirdPartyTag> = [
        remarketing(),
        simpleReach,
        permutive,
        ias,
        inizio,
        fbPixel(),
        twitterUwt(),
        connatix,
    ].filter(_ => _.shouldRun);

    const performanceServices: Array<ThirdPartyTag> = [
        imrWorldwide,
        imrWorldwideLegacy,
    ].filter(_ => _.shouldRun);

    insertScripts(advertisingServices, performanceServices);
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
        initPlistaRenderer();
    }

    loadOther();

    return Promise.resolve(true);
};

export { init };
export const _ = {
    insertScripts,
    loadOther,
    reset: () => {
        advertisingScriptsInserted = false;
        performanceScriptsInserted = false;
    },
};
