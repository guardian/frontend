// @flow

import { NOT_IN_TEST, notInTestVariant } from './ab-constants';

export const participationsToArray = (
    participations: Participations
): { testId: string, variantId: string }[] =>
    Object.keys(participations).map(testId => ({
        testId,
        variantId: participations[testId].variant,
    }));

export const arrayToParticipations = (
    arr: { testId: string, variantId: string }[]
): Participations =>
    arr.reduce(
        (obj, { testId, variantId }) => ({
            ...obj,
            [testId]: { variant: variantId },
        }),
        {}
    );

export const runnableTestsToParticipations = (
    runnableTests: $ReadOnlyArray<Runnable<ABTest>>
): Participations => {
    const participations: Participations = {};
    runnableTests.forEach(({ id: testId, variantToRun }) => {
        participations[testId] = { variant: variantToRun.id };
    });

    return participations;
};

export const filterParticipations = (
    participations: Participations,
    filter: ({ testId: string, variantId: string }) => boolean
): Participations =>
    arrayToParticipations(participationsToArray(participations).filter(filter));

// If the given test has a 'notintest' participation, return the notintest variant.
// Or else, if the given test has a normal variant participations, return that variant.
export const testAndParticipationsToVariant = (
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
