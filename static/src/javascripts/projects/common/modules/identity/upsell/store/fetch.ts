import {
    getAllConsents,
    getAllNewsletters,
    getSubscribedNewsletters,
    getUserFromApi,
} from 'common/modules/identity/api';
import { EmailConsentWithState, UserConsentWithState } from './types';

const fetchSubscribedConsents = (): Promise<string[]> =>
    new Promise((accept) => {
        getUserFromApi((user) => {
            if (user && user.consents) {
                accept(
                    user.consents
                        .filter((consent) => consent.consented === true)
                        .map((consent) => consent.id)
                );
            } else {
                accept([]);
            }
        });
    });

const fetchUserConsents = Promise.all([
    fetchSubscribedConsents(),
    getAllConsents(),
]).then(([acceptedConsents, allConsents]) =>
    allConsents.map(
        (consent) =>
            new UserConsentWithState(
                consent,
                acceptedConsents.includes(consent.id)
            )
    )
);

const fetchNewsletters = Promise.all([
    getAllNewsletters(),
    getSubscribedNewsletters(),
]).then(([allNewsletters, subscribedNewsletters]) =>
    allNewsletters.map(
        (nl) =>
            new EmailConsentWithState(
                nl,
                subscribedNewsletters.includes(nl.exactTargetListId.toString())
            )
    )
);

export { fetchUserConsents, fetchNewsletters };
