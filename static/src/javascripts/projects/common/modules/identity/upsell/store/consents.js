import {
    getAllConsents,
    getUserFromApi,
} from 'common/modules/identity/api';

type Consent = {
    id: string,
    name: string,
    description: string,
    isOptOut: boolean,
    isChannel: boolean,
    hasConsented: ?boolean,
};

const getUserConsents = (): Promise<string[]> => new Promise((accept, reject)=>{
    getUserFromApi(user => {
        if (user && user.consents) {
            accept(user.consents
                .filter(consent => consent.consented === true)
                .map(consent => consent.id)
            )
        }
        else {
            accept([]);
        }
    });
});

const fetchConsents = Promise.all([
    getUserConsents(),
    getAllConsents(),
]);

const get = (): Promise<Consent[]> =>
    fetchConsents.then(([acceptedConsents, allConsents]) => (
        allConsents.map(c =>
            ({
                ...c,
                hasConsented: acceptedConsents.includes(c.id)
            })
        )
    ));

const set = (consentId, value) => {
    console.log(1212);
};

export type {Consent}
export {get, set}
