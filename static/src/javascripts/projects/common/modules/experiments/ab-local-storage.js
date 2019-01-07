// @flow
import { local } from 'lib/storage';
import {
    NOT_IN_TEST,
    notInTestVariant,
    participationsKey,
} from 'common/modules/experiments/ab-constants';

export const participationsToArray = (
    participations: Participations
): { testId: string, variantId: string }[] =>
    Object.keys(participations).map(testId => ({
        testId,
        variantId: participations[testId].variant,
    }));

export const arrayToParticipations = (
    arr: { testId: string, variantId: string }[]
): Participations => {
    const participations: Participations = {};
    arr.forEach(({ testId, variantId }) => {
        participations[testId] = { variant: variantId };
    });

    return participations;
};

export const filterParticipations = (
    participations: Participations,
    filter: ({ testId: string, variantId: string }) => boolean
): Participations =>
    arrayToParticipations(participationsToArray(participations).filter(filter));

export const getParticipationsFromLocalStorage = (): Participations =>
    local.get(participationsKey) || {};

export const setParticipationsInLocalStorage = (
    participations: Participations
): void => {
    local.set(participationsKey, participations);
};

// If the given test has a variant which is specified in the participations, return it.
// Also return a 'notintest' variant, if such a participation is present for the supplied test.
export const variantFromParticipations = (
    test: ABTest,
    participations: Participations
): ?Variant => {
    const participation = participations[test.id];
    if (participation) {
        // We need to return something concrete here to ensure
        // that a notintest variant actually prevents other variants running.
        if (participation.variant === NOT_IN_TEST) {
            return notInTestVariant;
        }

        return test.variants.find(
            variant => variant.id === participation.variant
        );
    }

    return null;
};

export const runnableTestsToParticipations = (
    runnableTests: $ReadOnlyArray<Runnable<ABTest>>
): Participations => {
    const participations: Participations = {};
    runnableTests.forEach(({ id: testId, variantToRun }) => {
        participations[testId] = { variant: variantToRun.id };
    });

    return participations;
};

// Wipes all localStorage participations
export const clearParticipations = (): void => {
    local.remove(participationsKey);
};

export const getTestExclusionsFromLocalStorage = (): Participations =>
    filterParticipations(
        getParticipationsFromLocalStorage(),
        ({ variantId }) => variantId === NOT_IN_TEST
    );

// If the given test has a variant specified in localStorage, return it.
export const getVariantFromLocalStorage = (test: ABTest): ?Variant =>
    variantFromParticipations(test, getParticipationsFromLocalStorage());
