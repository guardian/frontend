// @flow
import { local } from 'lib/storage';
import { NOT_IN_TEST, participationsKey } from './ab-constants';
import {
    filterParticipations,
    testAndParticipationsToVariant,
    testSwitchExists,
} from './ab-utils';

// -------
// Reading
// -------
export const getParticipationsFromLocalStorage = (): Participations =>
    local.get(participationsKey) || {};

export const getTestExclusionsFromLocalStorage = (): Participations =>
    filterParticipations(
        getParticipationsFromLocalStorage(),
        ({ testId, variantId }) =>
            variantId === NOT_IN_TEST && testSwitchExists(testId)
    );

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
