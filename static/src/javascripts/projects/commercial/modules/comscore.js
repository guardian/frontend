// @flow strict
import { onConsentChange } from '@guardian/consent-management-platform';
import config from 'lib/config';
import { loadScript } from 'lib/load-script';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

type comscoreGlobals = {
    c1: string,
    c2: string,
    cs_ucfr: string,
    comscorekw?: string,
};

const comscoreSrc = '//sb.scorecardresearch.com/cs/6035250/beacon.js';
const comscoreC1 = '2';
const comscoreC2 = '6035250';
const SOURCEPOINT_ID: string = '5efefe25b8e05c06542b2a77';

let initialised = false;

const getGlobals = (
    consentState: boolean,
    keywords: string
): comscoreGlobals => {
    const globals: comscoreGlobals = {
        c1: comscoreC1,
        c2: comscoreC2,
        cs_ucfr: consentState ? '1' : '0',
    };

    if (keywords !== 'Network Front') {
        globals.comscorekw = keywords;
    }

    return globals;
};

const initOnConsent = (state: boolean | null) => {
    if (!initialised) {
        // eslint-disable-next-line no-underscore-dangle
        window._comscore = window._comscore || [];

        // eslint-disable-next-line no-underscore-dangle
        window._comscore.push(
            getGlobals(!!state, config.get('page.keywords', ''))
        );

        loadScript(comscoreSrc, { id: 'comscore', async: true });

        initialised = true;
    }
};

export const init = (): Promise<void> => {
    if (commercialFeatures.comscore) {
        onConsentChange(state => {
            if (state.tcfv2) {
                initOnConsent(state.tcfv2.vendorConsents[SOURCEPOINT_ID]);
            } else if (state.ccpa) {
                initOnConsent(!state.ccpa.doNotSell);
            }
        });
    }

    return Promise.resolve();
};

export const _ = {
    getGlobals,
    initOnConsent,
    comscoreSrc,
    comscoreC1,
    comscoreC2,
};
