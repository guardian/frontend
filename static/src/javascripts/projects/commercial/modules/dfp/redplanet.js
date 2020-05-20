// @flow strict

import config from 'lib/config';
import {commercialFeatures} from "common/modules/commercial/commercial-features";
import {onIabConsentNotification} from "@guardian/consent-management-platform";

const initialise = (): void => {
    onIabConsentNotification(state => {
        const consentState =
            state[1] && state[2] && state[3] && state[4] && state[5];

        if (consentState) {
            // Initialise Launchpad Tracker
            window.launchpad('newTracker', 'launchpad', 'lpx.qantas.com', {
                discoverRootDomain: true,
                appId: 'the-guardian'
            });

            // Track Page Views
            window.launchpad('trackUnstructEvent', {
                'schema': 'iglu:com.qantas.launchpad/hierarchy/jsonschema/1-0-0',
                'data': {
                    'u1': '{site-name}', // optional
                    'u2':  config.get('page.section'), // optional site-section
                    'u3': '{sub-section}', // optional sub-section
                    'u4': config.get('page.contentType'), // optional, eg: article, index, video
                    'uid': 'bwid?' // optional. If you have a logged in user-id, set the value here OPHAN BROWSER ID
                }
            });
        }
    });
};

const setupRedplanet: () => Promise<void> = () => {
    if (commercialFeatures.launchpad) {
        return import('lib/launchpad.js').then(() => {
            initialise();
            return Promise.resolve();
        });
    }

    return Promise.resolve();
};

export const init = (): Promise<void> => setupRedplanet();
