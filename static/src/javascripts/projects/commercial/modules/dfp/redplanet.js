// @flow strict

import config from 'lib/config';
import { onConsentChange } from '@guardian/consent-management-platform';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { isInAuOrNz } from 'common/modules/commercial/geo-utils';

let initialised = false;
const SOURCEPOINT_ID: string = '5f199c302425a33f3f090f51';

const initialise = (): void => {
    // Initialise Launchpad Tracker
    window.launchpad('newTracker', 'launchpad', 'lpx.qantas.com', {
        discoverRootDomain: true,
        appId: 'the-guardian',
    });

    // Track Page Views
    window.launchpad('trackUnstructEvent', {
        schema: 'iglu:com.qantas.launchpad/hierarchy/jsonschema/1-0-0',
        data: {
            u1: 'theguardian.com',
            u2: config.get('page.section'),
            u3: config.get('page.sectionName'),
            u4: config.get('page.contentType'),
            uid: config.get('ophan', {}).browserId,
        },
    });
};

const setupRedplanet: () => Promise<void> = () => {
    onConsentChange(state => {
        // CCPA only runs in the US and Redplanet only runs in Australia
        // so this should never happen
        if (state.ccpa) {
            throw new Error(
                `Error running Redplanet with CCPA (US CMP) present. It should only run in Australia on TCFv2 mode`
            );
        }
        let canRun: boolean;
        if (state.tcfv2) {
            // TCFv2 mode
            if (
                typeof state.tcfv2.vendorConsents !== 'undefined' &&
                typeof state.tcfv2.vendorConsents[SOURCEPOINT_ID] !==
                    'undefined'
            ) {
                canRun = state.tcfv2.vendorConsents[SOURCEPOINT_ID];
            } else {
                canRun = Object.values(state.tcfv2.consents).every(Boolean);
            }
        } else {
            // TCFv1 mode
            canRun = state[1] && state[2] && state[3] && state[4] && state[5];
        }

        if (!initialised && canRun) {
            initialised = true;
            return import('lib/launchpad.js').then(() => {
                initialise();
                return Promise.resolve();
            });
        }
    });
    return Promise.resolve();
};

export const init = (): Promise<void> => {
    if (commercialFeatures.launchpad && isInAuOrNz()) {
        return setupRedplanet();
    }
    return Promise.resolve();
};

export const resetModule = () => {
    initialised = false;
};
