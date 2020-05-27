// @flow strict

import config from 'lib/config';
import {commercialFeatures} from "common/modules/commercial/commercial-features";
import {onIabConsentNotification} from "@guardian/consent-management-platform";
import {isInAuRegion} from "commercial/modules/header-bidding/utils";
import { getUserFromCookie, isUserLoggedIn } from 'common/modules/identity/api';

const getUid = () : string => {
    if (isUserLoggedIn()) {
        const user = getUserFromCookie();
        if (user) {
            console.log("**** user cookie");
            console.log(user);
            console.log("**** user id");
            console.log(user.id);
            return user.id.toString();
        }
    }
    return config.get('ophan', {}).browserId;
}

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
            'u1': 'the-guardian',
            'u2':  config.get('page.section'),
            'u4': config.get('page.contentType'),
            'uid': getUid(),
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
    if (commercialFeatures.launchpad && isInAuRegion()) {
        return setupRedplanet();
    }
    return Promise.resolve();
}
