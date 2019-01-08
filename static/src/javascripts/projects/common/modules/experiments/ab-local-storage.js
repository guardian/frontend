// @flow
import { local } from 'lib/storage';
import { participationsKey } from './ab-constants';
import { testAndParticipationsToVariant } from './ab-utils';

// -------
// Reading
// -------
export const getParticipationsFromLocalStorage = (): Participations =>
    local.get(participationsKey) || {};

// If the given test has a variant specified in localStorage, return it.
export const getVariantFromLocalStorage = (test: ABTest): ?Variant =>
    testAndParticipationsToVariant(test, getParticipationsFromLocalStorage());

// -------
// Writing
// -------

// Wipes all localStorage participations
export const clearParticipations = (): void => {
    local.remove(participationsKey);
};

export const setParticipationsInLocalStorage = (
    participations: Participations
): void => {
    local.set(participationsKey, participations);
};
