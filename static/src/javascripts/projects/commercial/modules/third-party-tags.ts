/* A regionalised container for all the commercial tags. */

import {
    fbPixel,
    ias,
    inizio,
    lotame,
    permutive,
    remarketing,
    twitter,
} from '@guardian/commercial-core';
import {
    getConsentFor,
    onConsentChange,
} from '@guardian/consent-management-platform';
import { imrWorldwide } from 'commercial/modules/third-party-tags/imr-worldwide';
import { imrWorldwideLegacy } from 'commercial/modules/third-party-tags/imr-worldwide-legacy';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { isInAuOrNz, isInUsOrCa } from 'common/modules/commercial/geo-utils';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';

const addScripts = (tags: ThirdPartyTag[]): void => {
    const ref = document.scripts[0];
    const frag = document.createDocumentFragment();
    let hasScriptsToInsert = false;

    tags.forEach((tag) => {
        if (tag.loaded) {
            return;
        }
        if (tag.beforeLoad) {
            tag.beforeLoad();
        }
        if (tag.useImage && typeof tag.url !== 'undefined') {
            new Image().src = tag.url;
        }
        if (tag.insertSnippet) {
            tag.insertSnippet();
        } else {
            hasScriptsToInsert = true;
            const script = document.createElement('script');
            if (typeof tag.url !== 'undefined') {
                script.src = tag.url;
            }
            script.onload = tag.onLoad;
            if (tag.async) {
                script.setAttribute('async', '');
            }
            if (tag.attrs) {
                tag.attrs.forEach((attr) => {
                    script.setAttribute(attr.name, attr.value);
                });
            }
            frag.appendChild(script);
        }
        tag.loaded = true;
    });

    if (hasScriptsToInsert) {
        fastdom.mutate(() => {
            if (ref && ref.parentNode) {
                ref.parentNode.insertBefore(frag, ref);
            }
        });
    }
};

const insertScripts = (
    advertisingServices: ThirdPartyTag[],
    performanceServices: ThirdPartyTag[] // performanceServices always run
): void => {
    addScripts(performanceServices);
    onConsentChange((state) => {
        const consentedAdvertisingServices = advertisingServices.filter(
            (script) => getConsentFor(script.name, state)
        );

        if (consentedAdvertisingServices.length > 0) {
            addScripts(consentedAdvertisingServices);
        }
    });
};

const loadOther = (): void => {
    const advertisingServices: ThirdPartyTag[] = [
        remarketing({ shouldRun: config.get('switches.remarketing', false) }),
        permutive({ shouldRun: config.get('switches.permutive', false) }),
        ias({ shouldRun: config.get('switches.iasAdTargeting', false) }),
        inizio({ shouldRun: config.get('switches.inizio', false) }),
        fbPixel({
            shouldRun: config.get('switches.facebookTrackingPixel', false),
        }),
        twitter({ shouldRun: config.get('switches.twitterUwt', false) }),
        lotame({
            shouldRun:
                config.get('switches.lotame', false) &&
                !(isInUsOrCa() || isInAuOrNz()),
        }),
    ].filter((_) => _.shouldRun);

    const performanceServices: ThirdPartyTag[] = [
        imrWorldwide, // only in AU & NZ
        imrWorldwideLegacy, // only in AU & NZ
    ].filter((_) => _.shouldRun);

    insertScripts(advertisingServices, performanceServices);
};

const init = (): Promise<boolean> => {
    if (!commercialFeatures.thirdPartyTags) {
        return Promise.resolve(false);
    }

    loadOther();

    return Promise.resolve(true);
};

export { init };
export const _ = {
    insertScripts,
    loadOther,
};
