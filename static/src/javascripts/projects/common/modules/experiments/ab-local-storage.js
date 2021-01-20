import { storage } from '@guardian/libs';
import { participationsKey } from './ab-constants';
import { testAndParticipationsToVariant } from './ab-utils';

// -------
// Reading
// -------
export const getParticipationsFromLocalStorage = () =>
storage.local.get(participationsKey) || {};

// If the given test has a variant specified in localStorage, return it.
export const getVariantFromLocalStorage = (test) =>
    testAndParticipationsToVariant(test, getParticipationsFromLocalStorage());

// -------
// Writing
// -------

// Wipes all localStorage participations
export const clearParticipations = () => {
    storage.local.remove(participationsKey);
};

export const setParticipationsInLocalStorage = (
    participations
) => {
    storage.local.set(participationsKey, participations);
};
