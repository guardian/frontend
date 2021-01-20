

import config from 'lib/config';
import { onConsentChange, getConsentFor } from '@guardian/consent-management-platform';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { isInAuOrNz } from 'common/modules/commercial/geo-utils';

let initialised = false;

const initialise = () => {
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

const setupRedplanet = () => {
    onConsentChange((state) => {
        // CCPA only runs in the US and tcfv2 outside Aus
        // Redplanet only runs in Australia
        // so this should never happen
        if (!state.aus) {
            throw new Error(
                `Error running Redplanet without AUS consent. It should only run in Australia on AUS mode`
            );
        }
        const canRun = getConsentFor('redplanet', state);

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

export const init = () => {
    if (commercialFeatures.launchpad && isInAuOrNz()) {
        return setupRedplanet();
    }
    return Promise.resolve();
};

export const resetModule = () => {
    initialised = false;
};
