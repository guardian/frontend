// expose some frontend modules to atoms
// managed by the atoms team

import ophan from 'ophan/ng';
import fastdom from 'fastdom';
import { isAdFreeUser } from 'common/modules/commercial/user-features';
import {
    onConsentChange,
    getConsentFor,
} from '@guardian/consent-management-platform';
import { viewport } from './services/viewport';

// Need to pass in the API to native services, something that looks
// like this:
// {
//    ophan:    { record: function(obj) { ... } },
//    identity: { ... },
//    ...
// }


const promisify = (fdaction) => (
    thunk
) =>
    new Promise(resolve => {
        fdaction.call(fastdom, () => {
            resolve(thunk());
        });
    });

const onAcastConsentChange = (callback) => {
    onConsentChange(state => {
        const consented = getConsentFor('acast', state);
        callback(consented);
    });
};

const services = {
    ophan,
    dom: {
        write: promisify(fastdom.mutate),
        read: promisify(fastdom.measure),
    },
    viewport,
    consent: {
        onAcastConsentChange,
    },
    commercial: {
        isAdFree: isAdFreeUser(),
    },
};

export { services };
