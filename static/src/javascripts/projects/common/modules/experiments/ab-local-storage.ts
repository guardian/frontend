import type { ABTest, Participations, Variant } from '@guardian/ab-core';
import { storage } from '@guardian/libs';
import { participationsKey } from './ab-constants';
import { testAndParticipationsToVariant } from './ab-utils';

// -------
// Reading
// -------
export const getParticipationsFromLocalStorage = (): Participations =>
	(storage.local.get(participationsKey) as Participations | undefined) ?? {};

// If the given test has a variant specified in localStorage, return it.
export const getVariantFromLocalStorage = (
	test: ABTest,
): Variant | null | undefined =>
	testAndParticipationsToVariant(test, getParticipationsFromLocalStorage());

// -------
// Writing
// -------

// Wipes all localStorage participations
export const clearParticipations = (): void => {
	storage.local.remove(participationsKey);
};

export const setParticipationsInLocalStorage = (
	participations: Participations,
): void => {
	storage.local.set(participationsKey, participations);
};
