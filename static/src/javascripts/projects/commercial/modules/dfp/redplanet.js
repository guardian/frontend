// @flow strict

import config from 'lib/config';
import { commercialFeatures } from "common/modules/commercial/commercial-features";
import { onIabConsentNotification } from "@guardian/consent-management-platform";
import { isInAuRegion } from "commercial/modules/header-bidding/utils";
import { isInVariantSynchronous } from "common/modules/experiments/ab";
import { commercialRedplanet } from "common/modules/experiments/tests/commercial-redplanet-aus";

const initialise = (): void => {
    // Initialise Launchpad Tracker
    window.launchpad('newTracker', 'launchpad', 'lpx.qantas.com', {
        discoverRootDomain: true,
        appId: 'the-guardian'
    });

    // Track Page Views
    window.launchpad('trackUnstructEvent', {
        'schema': 'iglu:com.qantas.launchpad/hierarchy/jsonschema/1-0-0',
        'data': {
            'u1': 'theguardian.com',
            'u2':  config.get('page.section'),
            'u3':  config.get('page.sectionName'),
            'u4': config.get('page.contentType'),
            'uid': config.get('ophan', {}).browserId,
        }
    });
};

const setupRedplanet: () => Promise<void> = () => {
    onIabConsentNotification(state => {
        const consentState =
            state[1] && state[2] && state[3] && state[4] && state[5];

        if (consentState) {
            return import('lib/launchpad.js').then(() => {
                initialise();
                return Promise.resolve();
            });
        }
    });
    return Promise.resolve();
};

export const init = (): Promise<void> => {
    if (commercialFeatures.launchpad && isInAuRegion() && isInVariantSynchronous(commercialRedplanet, 'variant')) {
        return setupRedplanet();
    }
    return Promise.resolve();
}
